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
    deleteUser: function(id) {
      axios.post('/admin/user/delete',{id:id}).then(function(response) {

        var matched = _.findIndex(app.users,['id', id]);
        if (matched >= 0) {
          app.users.splice(matched,1);
        }
    });
    },
    toggleUserStatus: function(id,fieldName,status) {
      axios.post('/admin/user/toggle-status',{id:id,status:status,fn:fieldName}).then(function(response) {
        if (response.data) {
          var data=response.data,
            matched = _.findIndex(app.users,['id', id]),
            fieldLbl = fieldName + '_text';
          if (matched >= 0) {
            app.users[matched][fieldName] = data.status;
            app.users[matched][fieldLbl] = data.status? "yes" : "no";
          }
        }
    });
    },
  }
});