import request from '@/utils/request'

export default {
    // 获取列表数据
    getPageList(page, limit) {
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    },
    // 新增或修改品牌
    addOrupdate(value) {
        // 根据是否拥有id进行判断，添加没有id，修改有id
        //修改时，数据时请求回来的，所以有id，添加时搜集提交的，没有id
        if (value.id) {
            return request.put('/admin/product/baseTrademark/update', value)
        } else {
            return request.post('/admin/product/baseTrademark/save', value)
        }
    },
    //删除品牌
    deleteTrademark(id) {
        console.log('id', id)
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },
    // 获取所有的品牌列表
    getList() {
        return request.get('/admin/product/baseTrademark/getTrademarkList')
    }



}