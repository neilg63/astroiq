const express = require('express');
const router = express.Router();
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const pug = require('pug');
const _ = require('lodash');
const Cookies = require( "cookies" );
const textutils = require('./../lib/text-utils.js');
const moment = require('moment');
const variables = require('./../../content/variables.js');
const tplDir = __dirname + '/../../templates/';
const {User} = require('./../models/user');
const config = require('./../config/config');

var checkAdminUid = (req,res,callback) => {
  var cookies = new Cookies( req, res, { "keys": ['xyz'] } );
  req.uid = cookies.get( "uid", { signed: true } );
  req.isAdmin = cookies.get( "isAdmin", { signed: true } );
  if (req.isAdmin === 'true') {
    req.isAdmin = true;
  } else if (req.admin !== true) {
    req.isAdmin = false;
  }
  var hasUid = typeof req.uid == 'string', isAdmin = true === req.isAdmin;

  if (hasUid !== true || isAdmin !== true) {
    res.redirect('/');
  } else {
    callback();
  }
};

router.get('/', function(req, res) {
   const page = pug.compileFile(tplDir + 'admin/index.pug');
   res.send(page(variables));
});

router.get('/users', function(req, res) {
  checkAdminUid(req, res, () => {
    const page = pug.compileFile(tplDir + 'admin/users.pug');
    res.send(page(variables));
  });
});

router.get('/users-json', function(req, res) {
  checkAdminUid(req, res, () => {
    var users = User.find((err, data) => {
       if (err) {
        res.send({valid:false,num_users:0});
       } else {
        var users = _.map(data,(u) => {
          var d = moment.utc(u.created),
            isPublic = u.username == config.public.username;
          return {
            id:u._id,
            username:u.username,
            screenname:u.screenname,
            active:u.active,
            isAdmin:u.isAdmin,
            public: isPublic,
            isAdmin_text: u.isAdmin? "yes" : "no",
            authType:u.authType,
            active_text:u.active? "yes" : "no",
            created: d,
            created_ds: d.format('YYYY-MM-DD HH:mm')
          }
        });
        res.send({
          num_users: users.length,
          users: users
        });
       }
     });
  });
  
});

router.post('/user/delete', function(req, res) {
  checkAdminUid(req, res, () => {
    User.findByIdAndRemove(req.body.id,(err, data) => {
       if (err) {
        res.send({valid:false,msg:"Could not find user"});
      } else {
        res.send(data);
      }
     });
  });
});

router.post('/user/toggle-status', function(req, res) {
  checkAdminUid(req, res, () => {
    var newStatus = req.body.status? false : true, fn = req.body.fn, pd={};
    pd[fn] = newStatus;
    User.findByIdAndUpdate(req.body.id,{ $set: pd },(err, data) => {
       if (err) {
        res.send({valid:false,msg:"Could not find user"});
      } else {
        var ud = {
          id: data._id,
          fn: fn,
          status: newStatus
        };
        res.send(ud);
      }
     });
  });
});

router.get('/command', function(req, res) {
  checkAdminUid(req, res, () => {
    res.sendfile('./swetest.html');
  });
});

router.get('/swetest-backend',function(req,res) {
  checkAdminUid(req, res, () => {
  	if (req.query.cmd) {
  		var cmd = req.query.cmd,
  			valid = false,
  			msg = "Please enter a valid command";
  		if (typeof cmd == 'string') {
  			cmd = cmd.cleanCommand();
  			if (cmd.length>1) {
  					cmd = cmd.trim();
  				if (cmd !== 'whoami') {
  					if (cmd.startsWith('-')) {
  						var cmd = 'swetest ' + cmd;
  						valid = true;
  					} else {
  						msg = "Swetest command options must begin with a hyphen (-)";
  					}
  				} else {
  					valid = true;
  				}
  			}
  		}
  		if (valid) {

  			child = exec(cmd, function (error, stdout, stderr) {
  			  var data = {};
  			  if (!stderr) {
  			  	data.output = stdout;
  			  	data.valid = true;
  			  } else {
  			  	data.output = stderr;
  			  	data.valid = true;
  			  }
  			  res.send(data);
  			});
  		} else {
  			var data = {
  				valid: true,
  				output: msg
  			};
  			res.send(data);
  		}
  	}
  });
});

router.post('/git/:cmd', (req,res) => {
  checkAdminUid(req, res, () => {
    if (req.body.password) {
      var password = req.body.password,
        cmd = req.params.cmd,
        valid = false,
        msg = "Cannot validate your password.";
      
      var compPass = 'vimshottari',
        dt = new Date(),
        dtStr = ';' + ( dt.getHours() + dt.getDate() ),
        matchedStr = compPass + dtStr,
        valid = password === matchedStr;

      if (valid) {
        var cmds = [];
        switch (cmd) {
          case 'pull':
            cmds = ['pull','origin','dev'];
            break;
          case 'log':
            cmds = ['log'];
            break;
          case 'status':
            cmds = ['status'];
            break;
        }
        var process = spawn('git',cmds);
        var buf='', tmp='';
        process.stdout.on('data', (data) => {
          tmp = data.toString();
          if (typeof tmp == 'string') {
            if (tmp.length>0) {
              buf += tmp.split('<').join('&lt;').split('>').join('&gt;');
            }
          }
          
        });
        process.on('close', (data) => {
          res.send({
            valid: true,
            output: buf
          });
        });
      } else {
        var data = {
          valid: true,
          output: msg
        };
        res.send(data);
      }
    }
  });
});


module.exports = router;