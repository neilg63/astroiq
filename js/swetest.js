(function($) {
    $( document ).ready(function() {
        var cf = $('form#control-form');

        cf.on('submit',function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var cmdEl =$('#form-cmd'),cmd;
            if (cmdEl.length>0) {
                cmd = cmdEl.val();
                cmd = cmd.replace(/^swetest\s+/i,'');
                var params = {
                    cmd: cmd
                }
                var href = '/swetest-backend';
                $.ajax({
                    url: href,
                    data: params,
                    success: function(data) {
                        if (data.valid) {
                            $('#results-pane pre').html(data.output);
                        }
                    }
                });

            }
        });

        var gf = $('form#git-form');

        gf.on('submit',function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var passwd =$('#form-password'),pw;
            if (passwd.length>0) {
                pw = $.trim(passwd.val());
                if (pw.length > 8) {
                   $.post('/git-pull',{
                        password: pw
                    },function(data) {
                        if (data.valid) {
                            $('#results-pane pre').html(data.output);
                        }
                    }); 
                }
            }
        });
    });
})(jQuery);