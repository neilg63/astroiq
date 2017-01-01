(function($) {
    $( document ).ready(function() {
        var cf = $('form#control-form');
        if ($('#jqm-tag').length > 0) {
            window.location = '/command';
        }
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
                            $('form#control-form input.password').val('');
                            $('#results-pane pre').html(data.output);
                        }
                    }
                });

            }
        });

        var gf = $('form#git-form');
        $.ajax({
            url: '/server-datetime',
            success: function(data) {
                if (typeof data == 'object' && data.iso) {
                    $('form#git-form p:first').append('<em>Server datetime: '+data.iso.split('T').join(' ').replace(/([A-Z])/g," $1 ")+' -- ('+data.hours+' hrs)</em>')
                }
            }
        });
        $('#form-password').val('');
        gf.find('button').on('click',function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var passwd =$('#form-password'),
            it = $(this),
            cmd = it.attr('id').split('-').pop(),
            pw;
            if (passwd.length>0) {
                pw = $.trim(passwd.val());
                if (pw.length > 8) {
                   $.post('/git/' + cmd,{
                        password: pw
                    },function(data) {
                        if (data.valid) {
                            $('#results-pane pre').html(data.output);
                        }
                    }); 
                }
                setTimeout(function(){
                    $('#form-password').val('');
                },(5*60*1000));
            }
        });
    });
})(jQuery);