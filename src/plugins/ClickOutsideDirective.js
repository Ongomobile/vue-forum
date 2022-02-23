const ClickOutsideDirective = {
  mounted(el, binding) {
    // using __ClickOutsideHandler__ naming format to avoid name collisions
    el.__ClickOutsideHandler__ = (event) => {
      // check if anthing other than element or element children clicked
      if (!(el === event.target || el.contains(event.target))) {
        // the binding value in this case is userDropdownOpen data property we want to toggle
        binding.value(event)
      }
    }
    document.body.addEventListener('click', el.__ClickOutsideHandler__)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.__ClickOutsideHandler__)
  }
}
// This registers the directive to the whole app
export default (app) => {
  app.directive('click-outside', ClickOutsideDirective)
}
