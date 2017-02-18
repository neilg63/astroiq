var app = new Vue({
  el: '#astroiq',
  data: {
    showTopMenu: false,
    toggleMenuMessage: "Show main menu",
  },
  created: function() {
    
    //
  },
  methods: {
    toggleMenu: _.debounce(function(mode) {
      switch (mode) {
        case 'hide':
          this.showTopMenu = false;
          break;
        case 'show':
          this.showTopMenu = true;
          break;
        default:
          this.showTopMenu = !this.showTopMenu;
          break;
      }
      
    },25),
  }
});