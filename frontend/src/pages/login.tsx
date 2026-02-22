import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

export default function Login() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState('');

    const onSubmit = async (data: any) => {
        try {
            const res = await axios.post('http://localhost:4000/api/auth/login', data);
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl border border-border shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-foreground">Sign in to Swagger</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Or <Link href="/register" className="text-primary hover:text-primary/90">create an account</Link></p>
                </div>

                {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                type="email"
                                {...register('email', { required: true })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Email address"
                            />
                            {errors.email && <span className="text-xs text-destructive">Email is required</span>}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                {...register('password', { required: true })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Password"
                            />
                            {errors.password && <span className="text-xs text-destructive">Password is required</span>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
