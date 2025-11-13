
import React from 'react';

interface ProfileAndSettingsProps {
    onShare?: (options: any) => void;
}

const ProfileAndSettings: React.FC<ProfileAndSettingsProps> = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("This is a demo. Your settings have not been saved.");
    }
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* --- Profile Information --- */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Profile Information</h3>
                <p className="text-sm text-slate-400 mb-6">Manage your account information and password. (This is a demo)</p>
                <form onSubmit={handleSubmit} className="divide-y divide-slate-700">
                    <div className="py-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input type="text" id="name" defaultValue="Demo User" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <div className="flex items-center space-x-2">
                                    <input type="email" id="email" defaultValue="demo@example.com" className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                                    <button type="button" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-colors">Verify</button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
                                <div className="flex items-center space-x-2">
                                    <input type="tel" id="phone" placeholder="Add mobile number" className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                                    <button type="button" className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-colors">Verify</button>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="py-6">
                        <h4 className="text-lg font-semibold text-slate-200 mb-4">Change Password</h4>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                                <input type="password" id="current_password" placeholder="••••••••" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                            </div>
                             <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                                <input type="password" id="new_password" placeholder="••••••••" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-6">
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Address Details --- */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Address Details</h3>
                 <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label htmlFor="door_number" className="block text-sm font-medium text-slate-300 mb-2">Door/House Number</label>
                            <input type="text" id="door_number" placeholder="Apt 42" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">Street Address</label>
                            <input type="text" id="address" placeholder="123 AI Avenue" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">Village or City</label>
                            <input type="text" id="city" placeholder="Metropolis" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                            <label htmlFor="county" className="block text-sm font-medium text-slate-300 mb-2">County</label>
                            <input type="text" id="county" placeholder="Innovation County" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                         <div>
                            <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-2">State / Province</label>
                            <input type="text" id="state" placeholder="CA" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                         <div>
                            <label htmlFor="zip" className="block text-sm font-medium text-slate-300 mb-2">ZIP / Postal Code</label>
                            <input type="text" id="zip" placeholder="90210" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                     <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Save Address
                    </button>
                 </form>
            </div>

            {/* --- Application Settings --- */}
             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Application Settings</h3>
                 <div className="space-y-4 divide-y divide-slate-700">
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                         <span className="text-slate-300">Enable Email Notifications</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                         </label>
                    </div>
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                         <span className="text-slate-300">Theme</span>
                         <div className="bg-slate-700 p-1 rounded-lg">
                            <button className="px-3 py-1 rounded text-sm bg-cyan-500 text-white">Dark</button>
                            <button className="px-3 py-1 rounded text-sm text-slate-300 hover:bg-slate-600">Light</button>
                         </div>
                    </div>
                     <div className="flex items-center justify-between pt-4 first:pt-0">
                         <span className="text-slate-300">Language</span>
                         <select className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-500">
                            <option>English</option>
                            <option>Spanish (demo)</option>
                         </select>
                    </div>
                 </div>
            </div>
            
            {/* --- Account Actions --- */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                 <h3 className="text-xl font-bold mb-4">Account Actions</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-slate-200">Sign Out</h4>
                            <p className="text-sm text-slate-400">You will be logged out of your account on this device.</p>
                        </div>
                         <button onClick={() => alert('Signing out (demo)')} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Sign Out
                        </button>
                    </div>
                     <div className="flex items-center justify-between p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-red-400">Delete Account</h4>
                            <p className="text-sm text-slate-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        </div>
                         <button onClick={() => confirm('Are you sure you want to delete your account? (This is a demo)')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Delete Account
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default ProfileAndSettings;