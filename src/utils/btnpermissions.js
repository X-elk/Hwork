import store from '@/store'
export function btnPermissions(val) {
    return store.getters.buttons.indexOf(val)
}