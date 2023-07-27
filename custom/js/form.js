/**
 *  Boostrap Form Ajax Handling
 *
 *  Requires Bootstrap 4.3.1
 *  Requires Font Awesome 5
 *  Requires jQuery
 *  Requires Browser Support for FormData for multipart/form-data encryption type & ES6 Js
 *  Uses Animate.css
 *  Adjusted for Select2 Plugin
 *
 *  Created by Kevin Rosario on 2019-02-23
 */


class FormAjax {

    /**
     * use to find the default of undefined options
     */
    setDefaults(options, defaults){
        return $.extend({}, defaults, options || {});
    }

    defaultOptions(){
        let options = {

            /**
             * true or false to animate button icon when submitting form
             * uses and requires font-awesome 5 for icons
             */
            animateButton:"true",

            /**
             * Show summary message to the page as
             *  @modal - bootstrap modal
             *  @alert - bootstrap alert
             *  @sweet-alert - uses and requires sweel-alert 2
             *  @none - disabled summary
             */
            summaryType: "modal",

            /**
             * clear form values after submit
             */
            clearAfterSubmit: true,

            /**
             * Confirm before submit
             */
            confirmBeforeSubmit: true,

            /**
             * enable valid bootstrap feedback in form fields
             */
            enableValidFeedback: true,

            /**
             * pass a function after a success response in submission
             */
            callbackFunction: false

        };

        return options;
    }

    /**
     *
     * @param formTarget  - the form
     * @param options - for options
     */
    constructor(formTarget,options){

        this.formTarget = formTarget;
        this.url = formTarget.attr('action');
        this.method = formTarget.attr('method');
        this.enctype = this.formTarget.attr('enctype');
        this.submitted = false;

        // this.appendedData;

        /**
         * Set Options
         */
        this.options = this.setDefaults(options, this.defaultOptions());

        this.confirmed = false;

        this.setFormSubmit();
    }

    /**
     *
     * @param {*} data
     * Additional Data for FormData.append();
     */
    appendData(data){
        let _this = this;
        _this.appendedData = data;
    }

    /**
     * Sets Data for Ajax Request
     * Determines the encryption type of the form to prepare FormData()
     */
    setData(){
        let _this = this;
        if (_this.enctype !== 'multipart/form-data'){
            _this.data = _this.formTarget.serialize();
        } else{
            _this.data = new FormData(_this.formTarget[0]);
            $.each(_this.appendedData,function(k,v){
                _this.data.append(k,v);
            });
            _this.ajaxFormData = true;
        }
    }

    /**
     * Animation of button uses fontawesome spinner
     * @param type - start || stop
     */
    setAnimateButton(type){
        let _this = this;
        if (_this.options.animateButton){
            if (type=='start'){
                _this.formTarget.find("[type=submit]>i").addClass('fa-spinner fa-spin');
            }else{
                _this.formTarget.find("[type=submit]>i").removeClass('fa-spinner fa-spin');
            }
        }
    }

    /**
     * Adding Submit Event Listener in the form
     */
    setFormSubmit(){
        let _this = this;
        _this.formTarget.unbind('submit');
        _this.formTarget.on('submit',function (e) {
            e.preventDefault();

            /**
             * Show a confirmation before submitting the form if set
             */
            if (_this.confirmed !== true && _this.options.confirmBeforeSubmit){
                _this.showConfirmModal(
                    "<h3><i class='fas fa-exclamation-circle text-warning animated infinite pulse'></i> Wait</h3>",
                    "<p>Are you sure to continue your request?</p>",
                    "warning text-white"
                );
                return;
            }

            /**
             * Set the data to throw in ajax
             */
            _this.setData();
            /**
             * Set Button Animation Start
             */
            _this.setAnimateButton('start');

            /**
             * Set Ajax Options
             * @type {processData: boolean, data: *, success: success, type: *, error: error, url: *}
             */
            let options = {
                url: _this.url,
                type: _this.method,
                data: _this.data,
                success: function (data) {
                    /**
                     * Log Response enable for dev
                     */
                    window.console.log(data);

                    /**
                     * Remove all feedback in he form
                     */
                    _this.destroyFeedBack();

                    /**
                     * Remove indication of last field with a focus back class
                     */
                    _this.formTarget.find(".form-control.focus-back")
                        .removeClass('focus-back');

                    /**
                     * Check status response
                     */
                    if (data.status === 'Success'){
                        /**
                         * If status is Success execute this code block
                         */

                        /**
                         * Clear Form Values
                         */
                        _this.clearForm();

                        if(_this.options.summaryType == "modal"){
                            /**
                             * Show a Success Message
                             */
                            let title = '<h3><i class="fal fa-check-circle text-success animated infinite pulse"></i> Success</h3>';
                            let mess = '<p>Successfully submitted your form.</p>';
                            if(typeof data.customMessage != 'undefined'){
                                mess = '<p>'+data.customMessage+'</p>';
                                if(typeof data.customMessageHTML != 'undefined'){
                                    mess = data.customMessageHTML;
                                }
                            }
                            _this.showMessageModal(title,mess,'success');
                        }


                        /**
                         * Check if there is a set of callback function and execute it
                         */
                        if (typeof (_this.options.callbackFunction) === 'function') {
                            _this.options.callbackFunction(data);
                        }
                    } else {
                        /**
                         * If status is not Success execute this code block
                         */

                        /**
                         * Set Invalid Feedback in fields with error
                         */
                        if(data.errors){
                            _this.setFeedBack('invalid', data.errors);
                        }

                        /**
                         * Set Valid Feedback in valid fields if set
                         */
                        if (data.valid && _this.options.enableValidFeedback) {
                            _this.setFeedBack('valid', data.valid);
                        }

                        /**
                         * Get the first field with error and give a focus back class
                         */
                        let i = 0;
                        $.each(data.errors, function (k) {
                            if (i == 0) {
                                _this.formTarget.find(".form-control[name=" + k + "]")
                                    .addClass('focus-back');
                            } else {
                                return;
                            }
                            i++;
                        });


                        if(_this.options.summaryType == "modal") {
                            /**
                             * Show Unsuccessful Message
                             */
                            let title = '<h3><i class="fal fa-times-circle text-danger animated infinite pulse"></i> Oops</h3>';
                            let mess = '<p>There was a problem on submitting your form.</p>';
                            if (typeof data.customMessage != 'undefined') {
                                mess = '<p>' + data.customMessage + '</p>';
                                if (typeof data.customMessageHTML != 'undefined') {
                                    mess = data.customMessageHTML;
                                }
                            }
                            _this.showMessageModal(title,mess,'danger');
                        }
                    }

                    /**
                     * Set Submitted true
                     */
                    _this.submitted = true;

                    /**
                     * Set Button Animation stop
                     */
                    _this.setAnimateButton('stop');

                },
                error: function (data) {
                    /**
                     * Error Handler
                     */

                    /**
                     * Log Response enable for dev
                     */
                    window.console.log(data);

                    /**
                     * Show Problem Message
                     */
                    _this.showMessageModal(
                        '<h3><i class="fal fa-times-circle text-danger animated infinite pulse"></i> Oops</h3>',
                        '<p>Error encountered. Please reload your browser and try again.</p>',
                        'danger'
                    );

                    /**
                     * Set Button Animation stop
                     */
                    _this.setAnimateButton('stop');
                },
            };

            /**
             * Set for FormData()
             */
            if (_this.ajaxFormData){
                options.contentType = false;
                options.processData = false;
            }

            /**
             * Perform Ajax Request
             */
            $.ajax(options);
        });
    }


    /**
     * Clear values in the form
     */
    clearForm(){
        let _this = this;
        if (_this.options.clearAfterSubmit){
            _this.formTarget
                .find(".form-control").val('').trigger('change');;
        }
    }

    /**
     * Clear all feedback in the form
     */
    destroyFeedBack(){
        let _this = this;
        _this.formTarget
            .find(".form-control.is-valid,.form-control.is-invalid")
                .removeClass('is-valid')
                .removeClass('is-invalid')
            .siblings('.feedback')
                .removeClass('valid-feedback')
                .removeClass('invalid-feedback')
                .text('');
    }

    /**
     * Set a Feedback in the form
     * @param feedback_type - valid || invalid
     * @param feedback_items -
     * Array({'first_name':'This field is required'})
     * first_name = html name attribute
     */
    setFeedBack(feedback_type,feedback_items){
        let _this = this;
        $.each(feedback_items,function (attr_name,message) {
            if (message === undefined){
                message = "";
            }

            // Find field control by name attribute
            let field = _this.formTarget
                .find('.form-control[name="' + attr_name + '"]');


            // If failure check other instance
            if(field.length == 0){
                // Check for array name attribute
                field = _this.formTarget
                    .find('.form-control[name="' + attr_name + '[]"]');
            }

            // If failure check other instance
            if(field.length == 0){
                let s = attr_name.search('\w*(\.)[0-9](\.)\w*');
                let split = attr_name.split('\.');
                if(s != '-1'){
                    // Check for array name attribute
                    field = _this.formTarget
                        .find('.form-control[name="' + split[0] + '[' + split[1] + '][' + split[2] + ']"]');
                }
            }

            // set feedback
            field
                .addClass('is-'+feedback_type)
                .siblings('.feedback')
                .addClass(feedback_type+'-feedback')
                .text(message);

            /**
             * This is adjustment for Select2 Plugin
             */
            if(field.siblings('.select2-container').length > 0){
                field
                    .siblings('.select2-container')
                    .addClass('form-control is-'+feedback_type)
            }
        });
    }

    /**
     * Show Message Modal
     * @param title - Title of the modal
     * @param content - HTML content
     * @param type - Bootstrap default styles (e.g primary || success || warning || danger )
     */
    showMessageModal(title,content,type){
        let _this = this;
        if (type === undefined){
            type = 'primary';
        }

        _this.message_modal =
            $('<div>',{id:"formajax-message-modal",class:"modal fade animated zoomIn faster",role:"dialog",'tabindex':-1})
                .append($('<div>',{class:"modal-dialog modal-dialog-centered",role:"document"})
                    .append($('<div>',{class:"modal-content"})
                        .append($('<div>',{class:"modal-header"})
                            .html(title)
                        )
                        .append($('<div>',{class:"modal-body"}).html(content))
                        .append($('<div>',{class:"modal-footer"})
                            .append($('<button>',{id:"formajax-message-modal-button",type:"button",class:"btn btn-"+type,'data-dismiss':"modal",autofocus:"autofocus"})
                                .append($('<i>',{class:"fal fa-check-circle"}))
                                .append(" Got It")
                            )
                        )
                    )
                );

        // if($('#formajax-message-modal') !== undefined){
        //
        // }

        $('body').append(_this.message_modal);


        _this.message_modal.modal({
            keyboard:true,
            backdrop:true,
            focus:true
        });

        _this.message_modal.on('shown.bs.modal',function () {
            $(this).find("[autofocus]").focus();
        });

        _this.message_modal.on('hidden.bs.modal',function () {
            _this.formTarget.find(".focus-back").focus();
            $('#formajax-message-modal').remove();
        });
    }

    /**
     * Show Confirmation Modal
     * @param title - Title of Modal
     * @param content - HTML Content
     * @param type -  Bootstrap default styles (e.g primary || success || warning || danger )
     */
    showConfirmModal(title,content,type){
        // if($('#formajax-confirm-modal').length > 0){
            $('#formajax-confirm-modal').remove();
        // }
        let _this = this;
        if (type === undefined){
            type = 'danger';
        }

        _this.confirm_modal =
            $('<div>',{id:"formajax-confirm-modal",class:"modal fade animated zoomIn faster",role:"dialog",'tabindex':-1})
                .append($('<div>',{class:"modal-dialog modal-dialog-centered",role:"document"})
                    .append($('<div>',{class:"modal-content"})
                        .append($('<div>',{class:"modal-header"})
                            .html(title)
                        )
                        .append($('<div>',{class:"modal-body"}).html(content))
                        .append($('<div>',{class:"modal-footer"})
                            .append($('<button>',{id:"formajax-confirm-modal-button-cancel",type:"button",class:"btn btn-light",'data-dismiss':"modal",autofocus: "autofocus"})
                                .append($('<i>',{class:"fal fa-times-circle"}))
                                .append(" Cancel")
                            )
                            .append($('<button>',{id:"formajax-confirm-modal-button-continue",type:"button",class:"btn btn-"+type,'data-dismiss':"modal"})
                                .append($('<i>',{class:"fal fa-check-circle"}))
                                .append(" Yes, Continue")
                            )
                        )
                    )
                );



        $('body').append(_this.confirm_modal);

        _this.confirm_modal.modal({
            keyboard:true,
            backdrop:true,
            focus:true
        });

        _this.confirm_modal.on('shown.bs.modal',function () {
            $(this).find("[autofocus]").focus();
            $(this).find("#formajax-confirm-modal-button-continue").on("click",function () {
                _this.confirmed = true;
                _this.formTarget.submit();
            });
        });

        _this.confirm_modal.on('hide.bs.modal',function () {
            _this.confirmed = false;
            $('#formajax-confirm-modal').remove();
        });

        _this.confirm_modal.on('hidden.bs.modal',function () {
            _this.formTarget.find("[autofocus]").focus();


        });

    }

    /**
     * Set Values of fields in the Form
     * @param data Array({first_name:"Kevin"})
     */
    setValues(data = []){
        let _this = this;
        if (data){
            $.each(data,function (key,value) {
                let field = _this.formTarget.find('[name="'+key+'"]');

                field.val(value).trigger('change');
                if(field.attr('type') === "checkbox"){
                    field.prop("checked", parseInt(value));

                    field.on('change', evt => {
                        $(evt.target).val(($(evt.target).is(':checked')?1:0));
                    });

                }
            });
        }
    }


}








