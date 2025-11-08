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

// Thêm hàm lấy khung công khai từ API
export async function getPublicFramesFromAPI() {
  try {
    console.log(`🔍 Calling API: ${BACKEND_ORIGIN}/api/frames/public`)

    const response = await fetch(`${BACKEND_ORIGIN}/api/frames/public`, {
      credentials: 'include'
    })

    if (!response.ok) {
      console.warn(`❌ API failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log(`📦 Public frames from API:`, data)

    // Map dữ liệu từ backend
    const mapped = data.map(item => ({
      alias: item.Alias || item.alias,
      name: item.TieuDe || item.tieuDe || 'Khung không tên',
      thumb: (item.UrlXemTruoc || item.urlXemTruoc) ? `${BACKEND_ORIGIN}${item.UrlXemTruoc || item.urlXemTruoc}` : null,
      overlay: (item.UrlXemTruoc || item.urlXemTruoc) ? `${BACKEND_ORIGIN}${item.UrlXemTruoc || item.urlXemTruoc}` : null,
      id: item.Id || item.id,
      owner: item.owner || item.Owner || null,
      ngayTao: item.NgayDang || item.ngayDang || item.NgayTao || item.ngayTao || null,
      campaign: 'a80', // Gắn campaign cho filter
      featured: true, // Đánh dấu là nổi bật
      used24h: Math.floor(Math.random() * 100) + 50 // Random views để sort
    }))

    return mapped
  } catch (error) {
    console.error('❌ Error fetching public frames:', error)
    return null
  }
}

// Cập nhật hàm getFrameByAlias để trả về null thay vì khung mặc định
export async function getFrameByAlias(alias) {
  // Thử API trước
  const apiResult = await getFrameByAliasFromAPI(alias)
  if (apiResult) return apiResult

  // Fallback về mock data
  const mockFrame = FRAMES.find(f => f.alias === alias)
  if (mockFrame) return Promise.resolve(mockFrame)

  // ✅ Trả về null thay vì FRAMES[0] khi không tìm thấy
  return Promise.resolve(null)
}

// Cập nhật hàm getFrames để ưu tiên API
export async function getFrames() {
  // Thử lấy từ API trước
  const apiFrames = await getPublicFramesFromAPI()
  if (apiFrames && apiFrames.length > 0) {
    console.log('✅ Using frames from API')
    return Promise.resolve(apiFrames)
  }

  // Fallback về mock data (giới hạn 10 khung)
  console.log('⚠️ Fallback to mock data')
  return Promise.resolve(FRAMES.slice(0, 10))
}

// giữ nguyên các hàm

// Thay thế hàm getTrending() cũ bằng:
export async function getTrending(params = {}) {
  try {
    const { take = 20, skip = 0, signal } = params

    console.log(`🔍 Calling trending API: ${BACKEND_ORIGIN}/api/frames/trending-24h`)

    const response = await fetch(
      `${BACKEND_ORIGIN}/api/frames/trending-24h?take=${take}&skip=${skip}`,
      {
        credentials: 'include',
        signal
      }
    )

    if (!response.ok) {
      console.warn(`❌ Trending API failed: ${response.status}`)
      // Fallback về mock data
      return [...FRAMES].sort((a, b) => b.used24h - a.used24h).slice(0, take)
    }

    const data = await response.json()
    console.log(`📦 Trending API data:`, data)

    // Backend trả về: rank, id, tieuDe, alias, urlXemTruoc, views24h, downloads24h, score, percent, owner
    // Map sang format FE hiện tại
    const mapped = data.map(item => ({
      id: item.id || item.Id,
      alias: item.alias || item.Alias,
      name: item.tieuDe || item.TieuDe || 'Khung không tên',
      thumb: (item.urlXemTruoc || item.UrlXemTruoc)
        ? `${BACKEND_ORIGIN}${item.urlXemTruoc || item.UrlXemTruoc}`
        : '/placeholder-frame.png',
      overlay: (item.urlXemTruoc || item.UrlXemTruoc)
        ? `${BACKEND_ORIGIN}${item.urlXemTruoc || item.UrlXemTruoc}`
        : '/placeholder-frame.png',

      // ⭐ Dữ liệu xu hướng 24h
      rank: item.rank,
      views24h: item.views24h || item.Views24h || 0,
      downloads24h: item.downloads24h || item.Downloads24h || 0,
      score: item.score || item.Score || 0,
      percent: item.percent || item.Percent || 0,

      // Owner
      owner: item.owner || item.Owner || null,
      ngayTao: item.ngayDang || item.NgayDang || null
    }))

    return mapped

  } catch (error) {
    console.error('❌ Trending API error:', error)
    // Fallback về mock data
    return [...FRAMES].sort((a, b) => b.used24h - a.used24h).slice(0, params.take || 20)
  }
}




