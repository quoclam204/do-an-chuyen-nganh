import { ToggleRight } from 'lucide-react'

export default function SettingsTab() {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Cấu hình chung</h3>
                <div className="grid gap-4">
                    <div>
                        <label className="text-sm text-slate-600">Tên website</label>
                        <input className="mt-1 w-full rounded-2xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-blue-400" defaultValue="TrendyFrame" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-600">Frontend Origin</label>
                        <input className="mt-1 w-full rounded-2xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-blue-400" placeholder="https://trendyframe.me" />
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                        <div>
                            <div className="font-medium">Bật chế độ bảo trì</div>
                            <div className="text-xs text-slate-600">Tạm dừng người dùng truy cập frontend</div>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black">
                            <ToggleRight size={16} /> Bật/Tắt
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Tích hợp</h3>
                <div className="grid gap-4">
                    <div className="rounded-2xl ring-1 ring-slate-200 p-4">
                        <div className="font-medium">Google OAuth</div>
                        <div className="text-xs text-slate-600">Client ID / Secret</div>
                        <button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                            Cấu hình
                        </button>
                    </div>
                    <div className="rounded-2xl ring-1 ring-slate-200 p-4">
                        <div className="font-medium">Azure Storage</div>
                        <div className="text-xs text-slate-600">Kết nối lưu trữ ảnh</div>
                        <button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                            Kết nối
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}