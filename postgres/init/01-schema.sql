-- cyLive Streaming Platform - PostgreSQL Schema
-- Version: 1.0.0
-- Description: Complete schema initialization for the cyLive streaming platform

-- ============================================
-- 1. ENUMS AND TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('viewer', 'streamer', 'admin', 'moderator');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'pending_verification');
CREATE TYPE room_status AS ENUM ('live', 'offline', 'scheduled', 'ended');
CREATE TYPE room_visibility AS ENUM ('public', 'private', 'unlisted', 'subscriber_only');
CREATE TYPE transaction_type AS ENUM ('donation', 'subscription', 'tip', 'payout', 'refund', 'platform_fee');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'disputed');
CREATE TYPE chat_message_type AS ENUM ('text', 'emote', 'system', 'whisper');
CREATE TYPE moderation_action AS ENUM ('delete', 'timeout', 'ban', 'warn', 'shadowban');
CREATE TYPE recording_status AS ENUM ('processing', 'ready', 'deleted', 'failed');
CREATE TYPE watch_party_state AS ENUM ('playing', 'paused', 'buffering', 'ended');
CREATE TYPE guest_status AS ENUM ('invited', 'joined', 'declined', 'kicked', 'left');

-- ============================================
-- 2. EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 3. CORE TABLES
-- ============================================

-- Users table with auth, profile, and wallet fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile fields
    bio TEXT,
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    role user_role DEFAULT 'viewer',
    status user_status DEFAULT 'pending_verification',
    
    -- Stripe Connect integration
    stripe_connect_account_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    payout_enabled BOOLEAN DEFAULT FALSE,
    payout_schedule VARCHAR(50) DEFAULT 'weekly',
    
    -- Wallet fields
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Social/Auth
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Metadata
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Rooms table for streaming rooms with host relationships
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Room configuration
    title VARCHAR(200) NOT NULL,
    description TEXT,
    room_key VARCHAR(100) UNIQUE, -- for private rooms
    status room_status DEFAULT 'offline',
    visibility room_visibility DEFAULT 'public',
    
    -- Stream settings
    stream_key VARCHAR(255) UNIQUE,
    rtmp_url VARCHAR(500),
    max_viewers INTEGER DEFAULT 1000,
    
    -- Monetization
    donation_enabled BOOLEAN DEFAULT TRUE,
    subscription_tier_id UUID,
    
    -- Guest panel settings
    panel_enabled BOOLEAN DEFAULT FALSE,
    max_panel_guests INTEGER DEFAULT 20,
    panel_guests_only BOOLEAN DEFAULT FALSE, -- only allow guests on panel
    
    -- Watch party settings
    watch_party_enabled BOOLEAN DEFAULT FALSE,
    
    -- Stats
    current_viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    total_stream_time INTEGER DEFAULT 0, -- in seconds
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table for the 90/10 split atomic ledger
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Transaction participants
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    
    -- Transaction details
    transaction_type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Split details (90/10)
    platform_amount DECIMAL(10, 2) NOT NULL, -- 10%
    creator_amount DECIMAL(10, 2) NOT NULL,  -- 90%
    
    -- Stripe integration
    stripe_payment_intent_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    stripe_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Additional info
    message TEXT,
    metadata JSONB,
    
    -- Audit
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table with moderation fields
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Message content
    message_type chat_message_type DEFAULT 'text',
    content TEXT NOT NULL,
    raw_content TEXT, -- original content before filtering
    
    -- Moderation fields
    toxicity_score DECIMAL(5, 4), -- 0.0000 to 1.0000
    is_flagged BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_reason TEXT,
    
    -- Threading/replies
    parent_message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    
    -- Metadata
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Panel guests table for 20-guest system
CREATE TABLE panel_guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Guest position and state
    guest_position INTEGER NOT NULL CHECK (guest_position >= 1 AND guest_position <= 20),
    status guest_status DEFAULT 'invited',
    
    -- Permissions
    can_speak BOOLEAN DEFAULT TRUE,
    can_video BOOLEAN DEFAULT TRUE,
    is_screen_sharing BOOLEAN DEFAULT FALSE,
    
    -- WebRTC signaling
    webrtc_session_id VARCHAR(255),
    ice_servers JSONB,
    
    -- Engagement
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(room_id, guest_position)
);

-- Watch party sessions table
CREATE TABLE watch_party_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Video being watched
    video_url VARCHAR(500) NOT NULL,
    video_title VARCHAR(255),
    video_duration INTEGER, -- in seconds
    
    -- Server-authoritative sync state
    current_state watch_party_state DEFAULT 'paused',
    current_position DECIMAL(10, 3) DEFAULT 0.000, -- in seconds with millisecond precision
    playback_rate DECIMAL(3, 2) DEFAULT 1.00,
    
    -- Sync metadata
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_source VARCHAR(50) DEFAULT 'host', -- 'host' or 'server'
    
    -- Session lifecycle
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watch party participant sync state
CREATE TABLE watch_party_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES watch_party_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Client state reporting
    client_position DECIMAL(10, 3),
    client_state watch_party_state,
    buffer_health DECIMAL(5, 2), -- seconds of buffer
    
    -- Sync quality
    latency_ms INTEGER,
    drift_ms INTEGER,
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(session_id, user_id)
);

-- Stream recordings/hype clips table
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- uploader/creator
    
    -- Recording metadata
    title VARCHAR(255),
    description TEXT,
    recording_type VARCHAR(50) DEFAULT 'vod', -- 'vod', 'clip', 'highlight'
    status recording_status DEFAULT 'processing',
    
    -- Storage
    storage_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    
    -- Media info
    duration INTEGER, -- in seconds
    file_size BIGINT, -- in bytes
    resolution VARCHAR(20), -- e.g., "1920x1080"
    bitrate INTEGER, -- in kbps
    
    -- Hype clip specific
    clip_start_time INTEGER, -- seconds from stream start
    clip_end_time INTEGER,
    parent_recording_id UUID REFERENCES recordings(id) ON DELETE CASCADE,
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation logs table
CREATE TABLE moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who performed the action
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Target of the action
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    target_message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    target_recording_id UUID REFERENCES recordings(id) ON DELETE CASCADE,
    
    -- Action details
    action moderation_action NOT NULL,
    reason TEXT,
    duration INTEGER, -- in minutes for timeouts
    
    -- Evidence
    evidence_screenshot_url VARCHAR(500),
    message_content TEXT, -- snapshot of deleted message
    
    -- Auto-moderation
    is_auto_moderated BOOLEAN DEFAULT FALSE,
    auto_moderation_score DECIMAL(5, 4),
    
    -- Appeal
    appealed BOOLEAN DEFAULT FALSE,
    appeal_reason TEXT,
    appeal_resolved_at TIMESTAMP WITH TIME ZONE,
    appeal_resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_stripe_connect ON users(stripe_connect_account_id) WHERE stripe_connect_account_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Rooms indexes
CREATE INDEX idx_rooms_host ON rooms(host_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_visibility ON rooms(visibility);
CREATE INDEX idx_rooms_live ON rooms(status, visibility) WHERE status = 'live';

-- Transactions indexes
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_recipient ON transactions(recipient_id);
CREATE INDEX idx_transactions_room ON transactions(room_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_stripe ON transactions(stripe_payment_intent_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- Chat messages indexes
CREATE INDEX idx_chat_room ON chat_messages(room_id);
CREATE INDEX idx_chat_user ON chat_messages(user_id);
CREATE INDEX idx_chat_sent ON chat_messages(sent_at);
CREATE INDEX idx_chat_flagged ON chat_messages(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX idx_chat_toxicity ON chat_messages(toxicity_score) WHERE toxicity_score > 0.5;

-- Panel guests indexes
CREATE INDEX idx_panel_room ON panel_guests(room_id);
CREATE INDEX idx_panel_user ON panel_guests(user_id);
CREATE INDEX idx_panel_status ON panel_guests(status);
CREATE INDEX idx_panel_position ON panel_guests(room_id, guest_position);

-- Watch party indexes
CREATE INDEX idx_watch_party_room ON watch_party_sessions(room_id);
CREATE INDEX idx_watch_party_active ON watch_party_sessions(ended_at) WHERE ended_at IS NULL;

-- Watch party participants indexes
CREATE INDEX idx_watch_party_participants_session ON watch_party_participants(session_id);
CREATE INDEX idx_watch_party_participants_user ON watch_party_participants(user_id);

-- Recordings indexes
CREATE INDEX idx_recordings_room ON recordings(room_id);
CREATE INDEX idx_recordings_user ON recordings(user_id);
CREATE INDEX idx_recordings_status ON recordings(status);
CREATE INDEX idx_recordings_type ON recordings(recording_type);
CREATE INDEX idx_recordings_public ON recordings(is_public, status) WHERE is_public = TRUE AND status = 'ready';

-- Moderation logs indexes
CREATE INDEX idx_moderation_target_user ON moderation_logs(target_user_id);
CREATE INDEX idx_moderation_target_room ON moderation_logs(target_room_id);
CREATE INDEX idx_moderation_moderator ON moderation_logs(moderator_id);
CREATE INDEX idx_moderation_action ON moderation_logs(action);
CREATE INDEX idx_moderation_created ON moderation_logs(created_at);

-- ============================================
-- 5. AUDIT LOG TABLE
-- ============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_performed_at ON audit_log(performed_at);

-- ============================================
-- 6. TRIGGERS FOR AUDIT LOGGING
-- ============================================

-- Function to log changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), NULL);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NULL);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), NULL);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to all tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_rooms_trigger
    AFTER INSERT OR UPDATE OR DELETE ON rooms
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_chat_messages_trigger
    AFTER INSERT OR UPDATE OR DELETE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_panel_guests_trigger
    AFTER INSERT OR UPDATE OR DELETE ON panel_guests
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_watch_party_sessions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON watch_party_sessions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_recordings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON recordings
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_moderation_logs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON moderation_logs
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================
-- 7. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panel_guests_updated_at
    BEFORE UPDATE ON panel_guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_party_sessions_updated_at
    BEFORE UPDATE ON watch_party_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recordings_updated_at
    BEFORE UPDATE ON recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ROW-LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select_own ON users
    FOR SELECT USING (id = current_setting('app.current_user_id')::UUID OR 
                      current_setting('app.user_role')::user_role = 'admin');

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id')::UUID);

-- Rooms policies
CREATE POLICY rooms_select_all ON rooms
    FOR SELECT USING (
        visibility = 'public' OR 
        host_id = current_setting('app.current_user_id')::UUID OR
        current_setting('app.user_role')::user_role IN ('admin', 'moderator')
    );

CREATE POLICY rooms_insert_own ON rooms
    FOR INSERT WITH CHECK (host_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY rooms_update_host ON rooms
    FOR UPDATE USING (
        host_id = current_setting('app.current_user_id')::UUID OR
        current_setting('app.user_role')::user_role = 'admin'
    );

CREATE POLICY rooms_delete_host ON rooms
    FOR DELETE USING (
        host_id = current_setting('app.current_user_id')::UUID OR
        current_setting('app.user_role')::user_role = 'admin'
    );

-- Transactions policies
CREATE POLICY transactions_select_involved ON transactions
    FOR SELECT USING (
        sender_id = current_setting('app.current_user_id')::UUID OR
        recipient_id = current_setting('app.current_user_id')::UUID OR
        current_setting('app.user_role')::user_role = 'admin'
    );

-- Chat messages policies
CREATE POLICY chat_select_room_members ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rooms r 
            WHERE r.id = chat_messages.room_id 
            AND (r.visibility = 'public' OR r.host_id = current_setting('app.current_user_id')::UUID)
        ) OR current_setting('app.user_role')::user_role IN ('admin', 'moderator')
    );

CREATE POLICY chat_insert_own ON chat_messages
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY chat_update_moderator ON chat_messages
    FOR UPDATE USING (current_setting('app.user_role')::user_role IN ('admin', 'moderator'));

-- Panel guests policies
CREATE POLICY panel_select_room_members ON panel_guests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rooms r 
            WHERE r.id = panel_guests.room_id 
            AND (r.visibility = 'public' OR r.host_id = current_setting('app.current_user_id')::UUID)
        ) OR user_id = current_setting('app.current_user_id')::UUID
    );

CREATE POLICY panel_insert_host ON panel_guests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM rooms r 
            WHERE r.id = panel_guests.room_id 
            AND r.host_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Watch party sessions policies
CREATE POLICY watch_party_select_room_members ON watch_party_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rooms r 
            WHERE r.id = watch_party_sessions.room_id 
            AND (r.visibility = 'public' OR r.host_id = current_setting('app.current_user_id')::UUID)
        )
    );

CREATE POLICY watch_party_insert_host ON watch_party_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM rooms r 
            WHERE r.id = watch_party_sessions.room_id 
            AND r.host_id = current_setting('app.current_user_id')::UUID
        )
    );

CREATE POLICY watch_party_update_host ON watch_party_sessions
    FOR UPDATE USING (
        host_id = current_setting('app.current_user_id')::UUID
    );

-- Recordings policies
CREATE POLICY recordings_select_public ON recordings
    FOR SELECT USING (
        is_public = TRUE AND status = 'ready' OR
        user_id = current_setting('app.current_user_id')::UUID OR
        current_setting('app.user_role')::user_role = 'admin'
    );

CREATE POLICY recordings_insert_owner ON recordings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM rooms r 
            WHERE r.id = recordings.room_id 
            AND r.host_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Moderation logs policies (admin only)
CREATE POLICY moderation_select_admin ON moderation_logs
    FOR SELECT USING (current_setting('app.user_role')::user_role IN ('admin', 'moderator'));

CREATE POLICY moderation_insert_moderator ON moderation_logs
    FOR INSERT WITH CHECK (current_setting('app.user_role')::user_role IN ('admin', 'moderator'));

-- ============================================
-- 9. ATOMIC PAYMENT SPLIT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION create_transaction_with_split(
    p_sender_id UUID,
    p_recipient_id UUID,
    p_room_id UUID,
    p_amount DECIMAL(10, 2),
    p_currency VARCHAR(3),
    p_type transaction_type,
    p_message TEXT,
    p_stripe_payment_intent_id VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_platform_amount DECIMAL(10, 2);
    v_creator_amount DECIMAL(10, 2);
BEGIN
    -- Calculate split (90% to creator, 10% to platform)
    v_creator_amount := p_amount * 0.90;
    v_platform_amount := p_amount * 0.10;
    
    -- Create transaction with atomic split
    INSERT INTO transactions (
        sender_id,
        recipient_id,
        room_id,
        transaction_type,
        amount,
        currency,
        platform_amount,
        creator_amount,
        stripe_payment_intent_id,
        message,
        status,
        processed_at
    ) VALUES (
        p_sender_id,
        p_recipient_id,
        p_room_id,
        p_type,
        p_amount,
        p_currency,
        v_platform_amount,
        v_creator_amount,
        p_stripe_payment_intent_id,
        p_message,
        'completed',
        NOW()
    )
    RETURNING id INTO v_transaction_id;
    
    -- Update creator's wallet
    UPDATE users 
    SET wallet_balance = wallet_balance + v_creator_amount,
        total_earnings = total_earnings + v_creator_amount
    WHERE id = p_recipient_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. CHAT MODERATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION flag_message(
    p_message_id UUID,
    p_toxicity_score DECIMAL(5, 4)
)
RETURNS VOID AS $$
BEGIN
    UPDATE chat_messages
    SET is_flagged = TRUE,
        toxicity_score = p_toxicity_score
    WHERE id = p_message_id;
    
    -- Auto-delete if toxicity is very high (>0.85)
    IF p_toxicity_score > 0.85 THEN
        UPDATE chat_messages
        SET is_deleted = TRUE,
            deleted_reason = 'Auto-moderated: High toxicity score'
        WHERE id = p_message_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. VIEW SUMMARIES
-- ============================================

-- Creator earnings summary view
CREATE VIEW creator_earnings_summary AS
SELECT 
    u.id AS creator_id,
    u.username,
    u.display_name,
    COUNT(t.id) AS total_transactions,
    COALESCE(SUM(t.creator_amount), 0) AS total_earnings,
    COALESCE(SUM(CASE WHEN t.created_at >= NOW() - INTERVAL '30 days' THEN t.creator_amount ELSE 0 END), 0) AS earnings_30d,
    COALESCE(SUM(CASE WHEN t.created_at >= NOW() - INTERVAL '7 days' THEN t.creator_amount ELSE 0 END), 0) AS earnings_7d,
    u.wallet_balance
FROM users u
LEFT JOIN transactions t ON u.id = t.recipient_id AND t.status = 'completed'
WHERE u.role = 'streamer'
GROUP BY u.id, u.username, u.display_name, u.wallet_balance;

-- Room analytics view
CREATE VIEW room_analytics AS
SELECT 
    r.id AS room_id,
    r.title,
    r.host_id,
    u.username AS host_username,
    r.status,
    r.current_viewers,
    r.peak_viewers,
    r.total_stream_time,
    COUNT(DISTINCT t.id) AS total_transactions,
    COALESCE(SUM(t.amount), 0) AS total_revenue,
    COUNT(DISTINCT pg.id) AS current_panel_guests,
    COUNT(DISTINCT cm.id) AS total_messages,
    COUNT(DISTINCT CASE WHEN cm.is_flagged THEN cm.id END) AS flagged_messages
FROM rooms r
JOIN users u ON r.host_id = u.id
LEFT JOIN transactions t ON r.id = t.room_id AND t.status = 'completed'
LEFT JOIN panel_guests pg ON r.id = pg.room_id AND pg.status = 'joined'
LEFT JOIN chat_messages cm ON r.id = cm.room_id
GROUP BY r.id, r.title, r.host_id, u.username, r.status, r.current_viewers, r.peak_viewers, r.total_stream_time;

-- ============================================
-- 12. INITIAL DATA
-- ============================================

-- Create admin user (password should be changed immediately)
INSERT INTO users (email, username, display_name, password_hash, role, status, email_verified)
VALUES (
    'admin@cylive.com',
    'admin',
    'System Administrator',
    crypt('ChangeThisPassword123!', gen_salt('bf')),
    'admin',
    'active',
    TRUE
);

-- ============================================
-- 13. CONSTRAINTS SUMMARY (for reference)
-- ============================================

-- Foreign keys defined inline in table definitions
-- Additional constraints:
ALTER TABLE transactions ADD CONSTRAINT check_positive_amount CHECK (amount > 0);
ALTER TABLE transactions ADD CONSTRAINT check_split_amount CHECK (platform_amount + creator_amount = amount);
ALTER TABLE rooms ADD CONSTRAINT check_max_viewers CHECK (max_viewers > 0);
ALTER TABLE panel_guests ADD CONSTRAINT check_valid_position CHECK (guest_position BETWEEN 1 AND 20);
ALTER TABLE watch_party_sessions ADD CONSTRAINT check_playback_rate CHECK (playback_rate BETWEEN 0.25 AND 4.0);
