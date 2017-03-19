var app = new Vue({
  el: '#astroiq',
  data: {
    showTopMenu: false,
    toggleMenuMessage: "Show main menu",
    user: {
      loggedin: false,
      showForm: false,
      registerMode: "login",
      submitLabel: "Log in!",
      username: "",
      screenname: "",
      password: "",
      cpassword: "",
      id: "",
      type: "",
      isAdmin: false,
      statusMsg: "Not logged in",
      errorMsg: ""
    },
    num_users: 0,
    users: [],
    showStatusMsg:false,
    confirmPath: "",
  },
  created: function() {
    var ud = getItem('user');
    if (ud.data) {
      if (ud.data.id) {
        this.user = ud.data;
        this.user.showForm = false;
      }
    }
     axios.get('/admin/users-json').then(function(response) {
      if (response.data) {
        var data = response.data;
        if (data.users) {
          app.num_users = data.num_users;
          app.users = data.users;
        }
      }
    });
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