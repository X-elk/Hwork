import request from '@/utils/request'
export default {
    getCategory1Idlist() {
        return request.get('/admin/product/getCategory1')
    },
    getCategory2Idlist(category1Id) {
        return request.get(`/admin/product/getCategory2/${category1Id}`)
    },
    getCategory3Idlist(category1Id) {
        return request.get(`/admin/product/getCategory3/${category1Id}`)
    },
}