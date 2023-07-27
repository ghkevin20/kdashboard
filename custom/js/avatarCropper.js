/**
 * Avatar Cropper
 *
 * Requires Bootstrap 4
 * Requires Font Awesome 5
 * Requires jQuery
 * Requires Cropper.js
 * Associated with FormAjax form.js
 *
 * Created by Kevin Rosario on 2019-04-24
 */
class AvatarCropper {
    /**
     * use to find the default of undefined options
     */
    setDefaults(options, defaults){
        return $.extend({}, defaults, options || {});
    }

    defaultOptions(){
        let options = {
            /**
             * Modal Id set if having a custom modal
             */
            modalId:"cropper-modal",
            /**
             * Cropper Modal Title
             */
            modalTitle:"Crop Image",
            /**
             * Cropper Result Viewer
             */
            cropperResultImage:"cropper-result-image",
        }

        return options;
    }

    /**
     *
     * @param inputPicker
     * @param instanceFormAjax
     * @param options
     */
    constructor(inputPicker,instanceFormAjax,options){
        this.input = inputPicker;
        this.instanceFormAjax = instanceFormAjax;
        this.image;
        this.modal;
        this.cropper;

        /**
         * Set Options
         */
        this.options = this.setDefaults(options, this.defaultOptions());


        this.setCropper();
    }

    createModal(){
        let _this = this;
        var modal =
        $('<div>',{id:"cropper-modal",class:"modal fade animated zoomIn faster",role:"dialog",'tabindex':-1,'data-backdrop':false})
        .append($('<div>',{class:"modal-dialog modal-dialog-centered",role:"document"})
            .append($('<div>',{class:"modal-content"})
                .append($('<div>',{class:"modal-header"})
                    .append(
                        $('<h5>',{class:"modal-title"}).html(" "+_this.options.modalTitle)
                            .prepend($('<i>',{class:"fal fa-crop"}))
                    )

                    .append($('<button>',{type:"button",class:"close",'data-dismiss':"modal",'aria-label':"Close"}).html("&times;"))
                )
                .append($('<div>',{class:"modal-body"})
                    .append($('<div>',{class:"cropper-img-container"})
                        .append($('<img>',{src:"#",id:"cropper-image",class:"w-100"}))
                    )
                )
                .append($('<div>',{class:"modal-footer"})
                    .append($('<button>',{type:"button",class:"btn btn-light",'data-dismiss':"modal"})
                        .append($('<i>',{class:"fal fa-times-circle"}))
                        .append(" Cancel")
                    )
                    .append($('<button>',{id:"cropper-crop",type:"button",class:"btn btn-primary",autofocus:"autofocus"})
                        .append($('<i>',{class:"fal fa-crop"}))
                        .append(" Crop")
                    )
                )
            )
        );
        $('body').append(modal);
        return modal;
    }

    setCropperModal(){
        let _this = this;
        _this.modal = _this.createModal();
        _this.image = document.getElementById('cropper-image');
    }

    setCropper(){
        let _this = this;
        _this.setCropperModal();

        // When File Image Picker Changes Value
        _this.input.addEventListener('change', function (e) {
            var files = e.target.files;
            /**
             * @argument function
             * to set image src value
             * at modal and trigger Cropper when modal shown
             **/
            var done = function (url) {
                _this.image.value = '';
                _this.image.src = url;
                _this.modal.modal('show');
            };

            // File Reader
            var reader;
            var file;
            var url;

            if (files && files.length > 0) {
                file = files[0];
                if (URL) {
                    done(URL.createObjectURL(file));
                } else if (FileReader) {
                    reader = new FileReader();
                    reader.onload = function (e) {
                        done(reader.result);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });

        // Init Cropper via Modal Show/Hide
        _this.modal.on('shown.bs.modal', function () {
            _this.cropper = new Cropper(_this.image, {
                responsive: true,
                autoCropArea: 1,
                aspectRatio: 1,
                viewMode: 3,
            });
        }).on('hidden.bs.modal', function () {
            _this.cropper.destroy();
            _this.cropper = null;
        });

        // Crop
        document.getElementById('cropper-crop').addEventListener('click', function () {
            var canvas;
            // Close Modal
            _this.modal.modal('hide');

            if (_this.cropper) {
                // Data to Server
                _this.cropper.getCroppedCanvas().toBlob(function (blob) {
                    _this.instanceFormAjax.appendData({'avatar':blob});
                });
                // Data for Client View
                canvas = _this.cropper.getCroppedCanvas({
                    width: 128,
                    height: 128,
                });

                $("#"+_this.options.cropperResultImage).attr('src',canvas.toDataURL());
            }
        });
    }
}
