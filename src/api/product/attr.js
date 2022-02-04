import request from '@/utils/request'
export default {
    getCategoryList(category1Id, category2Id, category3Id) {
        return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
    },
    saveAttr(attr) {
        return request.post('/admin/product/saveAttrInfo', attr)
    },
    removeAttr(attrId) {
        return request.delete(`/admin/product/deleteAttr/${attrId}`)
    }
}