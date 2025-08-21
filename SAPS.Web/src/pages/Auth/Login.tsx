import React, { useState } from 'react';
import { useAuth } from '@/services/auth/AuthContext';
// import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/button';
import { Lock } from 'lucide-react';
import { Input } from '@heroui/input';
import { Checkbox } from '@heroui/react';
// import { OWNER_ROLE } from '@/config/base';

export default function LoginPage() {
    const { login, loading } = useAuth();
    // const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(email, password, remember);
            window.location.reload();
        } catch (err) {
            console.log(err);
            const message = err instanceof Error
                ? err.message
                : (typeof err === 'object' && err && 'message' in (err as any))
                    ? String((err as any).message)
                    : 'Invalid email or password';
            setError(message);
        } finally {
            setSubmitting(false);
        }

    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-secondary to-primary">
            <div className="bg-white rounded-lg shadow-lg flex w-full max-w-4xl overflow-hidden">
                {/* Left side */}
                <div className="flex-1 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-primary to-secondary text-white md:block ">
                    <div className="mb-6">
                        <span className="inline-block bg-blue-100 p-4 rounded-full">
                            <span role="img" aria-label="car" className="text-4xl">🚗</span>
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-2">SAPLS</h1>
                    <h2 className="text-xl font-semibold mb-4">Semi-Automatic Parking Lot System</h2>
                    <p className="mb-6 text-center max-w-xs">
                        Advanced parking management platform with automated license plate recognition, real-time monitoring, and comprehensive analytics.
                    </p>
                    <div className=" gap-6 mt-4 ">
                        <div className="flex flex-col items-center">
                            <span role="img" aria-label="AI Recognition">📷</span>
                            <span className="text-xs mt-1">AI Recognition</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span role="img" aria-label="Analytics">📊</span>
                            <span className="text-xs mt-1">Analytics</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span role="img" aria-label="Secure">🔒</span>
                            <span className="text-xs mt-1">Secure</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span role="img" aria-label="Fast">⚡</span>
                            <span className="text-xs mt-1">Fast</span>
                        </div>
                    </div>
                </div>
                {/* Right side */}
                <div className="flex-1 flex flex-col justify-center p-10">
                    <h2 className="text-3xl font-bold text-blue-900 mb-2">Admin Login</h2>
                    <p className="text-gray-500 mb-6">Access the administrative dashboard</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-blue-900 font-semibold mb-1">Admin ID / Email</label>
                            <Input
                                type="email"
                                className="w-full rounded-md "
                                placeholder="Enter your admin ID or email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-blue-900 font-semibold mb-1">Password</label>
                            <Input
                                type="password"
                                className="w-full  rounded-md  "
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-gray-700">
                                <Checkbox
                                    type="checkbox"
                                    className="mr-2"
                                    checked={remember}
                                    onChange={e => setRemember(e.target.checked)}
                                />
                                Remember me
                            </label>
                            <a href="#" className="text-blue-500 text-sm hover:underline">Forgot Password?</a>
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <Button
                            type="submit"
                            className="w-full py-2 rounded-md bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                            disabled={submitting || loading}
                            startContent={<Lock size={16} />}
                        >
                            {submitting || loading ? 'Signing In...' : 'Sign In '}
                        </Button>
                    </form>
                    <div className="mt-6 p-4 bg-blue-100 rounded-md flex items-start gap-2">
                        <span className="text-blue-500 text-2xl">🛡️</span>
                        <div>
                            <div className="font-semibold text-blue-900">Secure Access</div>
                            <div className="text-sm text-blue-800">This is a restricted area. Only authorized administrative personnel are permitted to access this system.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}