// src/utils/frameService.js
export const FRAMES = [
  {
    alias: 'quockhanh',
    name: 'Khung Quốc Khánh',
    color: '#e11d48',
    // Thumbnail chỉ để hiển thị ngoài grid
    thumb: '/frames/khung-hinh-quockhanh.png',
    // 👉 PNG trong suốt để overlay trong Editor (đặt file vào public/frames/tet.png)
    overlay: '/frames/khung-hinh-quockhanh.png',
    used24h: 128,
    campaign: 'A80',
  },
  {
    alias: 'khung304',
    name: 'Khung 30/04',
    color: '#dc2626',
    thumb: '/frames/kh3.png',
    overlay: '/frames/kh3.png',
    used24h: 86,
    campaign: 'A80',
  },
  {
    alias: 'trungthu',
    name: 'Khung Trung thu',
    color: '#f43f5e',
    thumb: '/frames/khung-trung-thu.png',
    overlay: '/frames/khung-trung-thu.png',
    used24h: 64,
    campaign: 'A80',
  },
  {
    alias: 'giangsinh',
    name: 'Khung Giáng sinh',
    color: '#22c55e',
    thumb: '/frames/khung-giang-sinh.png',
    overlay: '/frames/khung-giang-sinh.png',
    used24h: 44,
    campaign: 'A80',
  },

  {
    alias: 'daihoi3',
    name: 'Khung Đại hội Lần III',
    thumb: '/frames/kh1.png',
    overlay: '/frames/kh1.png',
    author: 'MARKETING VEC',
    tags: ['a80', 'daihoi', '2025'],
    featured: true
  },

  {
    alias: 'khung-phuong-tan-son-nhi',
    name: 'Khung Phường Tân Sơn Nhì',
    thumb: '/frames/kh2.png',
    overlay: '/frames/kh2.png',
    author: 'MARKETING VEC',
    tags: ['a80', 'daihoi', '2025'],
    featured: true
  }
]

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')

// Thêm hàm gọi API thực
export async function getFrameByAliasFromAPI(alias) {
  try {
    console.log(`🔍 Calling API: ${BACKEND_ORIGIN}/api/frames/alias/${alias}`)

    const response = await fetch(`${BACKEND_ORIGIN}/api/frames/alias/${alias}`, {
      credentials: 'include'
    })

    console.log(`📡 Response status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log(`📦 Raw backend data:`, data)

    // ✅ Xử lý cả PascalCase VÀ camelCase từ backend
    const mapped = {
      alias: data.Alias || data.alias,
      name: data.TieuDe || data.tieuDe || 'Khung không tên',
      // ✅ Thêm BACKEND_ORIGIN cho URL đầy đủ, xử lý cả 2 format
      thumb: (data.UrlXemTruoc || data.urlXemTruoc) ? `${BACKEND_ORIGIN}${data.UrlXemTruoc || data.urlXemTruoc}` : null,
      overlay: (data.UrlXemTruoc || data.urlXemTruoc) ? `${BACKEND_ORIGIN}${data.UrlXemTruoc || data.urlXemTruoc}` : null,
      id: data.Id || data.id,

      // Thêm owner và ngày tạo:
      owner: data.owner || data.Owner || null,
      ngayTao: data.NgayDang || data.ngayDang || null, // hoặc NgayDang nếu bạn dùng PascalCase
    }


    console.log(`🎯 Mapped data:`, mapped)
    return mapped
  } catch (error) {
    console.error('❌ API Error:', error)
    return null
  }
}

// Cập nhật hàm getFrameByAlias để gọi API trước
export async function getFrameByAlias(alias) {
  // Thử API trước
  const apiResult = await getFrameByAliasFromAPI(alias)
  if (apiResult) return apiResult

  // Fallback về mock data
  return Promise.resolve(FRAMES.find(f => f.alias === alias) || FRAMES[0])
}

// giữ nguyên các hàm
export function getFrames() { return Promise.resolve(FRAMES) }
export function getTrending() { return Promise.resolve([...FRAMES].sort((a, b) => b.used24h - a.used24h)) }




