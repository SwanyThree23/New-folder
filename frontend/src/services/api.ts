export const RoomService = {
    // Connect to Backend to generate room
    async create(data: any): Promise<any> {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    // Get Room public info
    async get(id: string): Promise<any> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/rooms/${id}`);
            if (!res.ok) throw new Error('Room not found');
            return res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};

export const AuthService = {
    logout() {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};
