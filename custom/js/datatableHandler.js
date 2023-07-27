/**
 * DataTables Handler
 *
 * Requires Bootstrap 4
 * Requires jQuery
 * Requires Datatables
 * Requires FormAjax
 *
 * Created by Kevin Rosario on 2019-04-24
 */
class DTHandler {
    /**
     * use to find the default of undefined options
     */
    setDefaults(options, defaults){
        return $.extend({}, defaults, options || {});
    }

    defaultOptions(){
        let options = {
            /**
             * Buttons
             */
            buttons:['create','search','filter','colvis','export','refresh'],
            /**
             * Row Actions
             */
            actions:['view','edit','trash','restore'],
            /**
             * Clone Footer
             */
            cloneFooter:false,
            /**
             * Enable Form Trash
             */
            enableFormTrash:true,

            /**
             * Form Trash Custom Fields
             */
            trashFields: [],

            /**
             * Laravel Fields sets to set default setting for laravel form trash handling
             */
            laravelTrash: false,
            /**
             * csrf must be set in meta
             */
            laravelFields: [
                {
                    type:"hidden",
                    name:"_token",
                    value: $('meta[name="csrf-token"]').attr('content'),
                },
                {
                    type:"hidden",
                    name:"_method",
                    value:"DELETE",
                }
            ],

            /**
             * Link Index
             */
            linkIndex:'',
            /**
             * CRUD Create Link
             */
            linkCreate:'',
            linkStore:'',
            /**
             * CRUD Read Link
             */
            linkView:'',
            /**
             * CRUD Edit Link
             */
            linkEdit:'',
            linkUpdate:'',
            /**
             * CRUD Delete Link
             */
            linkDelete:'',
            /**
             * CRUD Restore Link
             */
            linkRestore:'',
            /**
             * Use laravel link set the index url
             */
            laravelLink:'',
            /**
             * View Modal
             */
            viewModal:null,
        }
        return options;
    }

    /**
     *
     * @param {*} table
     * @param {*} datatableHandler
     * @param {*} options
     */
    constructor(handlerWrapper,datatableOptions,options){
        this.handlerWrapper = handlerWrapper;
        let table = handlerWrapper.find('.dt-table');
        /**
         * Table
         */
        this.t = table;
        this.id = typeof table.attr('id') == 'undefined' ? 'table': table.attr('id');
        this.datatableOptions = datatableOptions;
        this.dtHandler;
        this.exportCols;
        this.formTrash;
        this.formTrashHandler;
        /**
         * Set Options
         */
        this.options = this.setDefaults(options, this.defaultOptions());

        this.initHandler();
    }

    cloneFooter(){
        let _this = this;
        var head = _this.t.find('thead').html();

        if( _this.t.children('tbody').length == 0 ){
            _this.t.append($('<tbody>'));
        }

        if( _this.t.children('tfoot').length == 0 ){
            _this.t.append($('<tfoot>'));
        }

        _this.t.children('tfoot').append($(head));
    }

    getColumns(){
        let _this = this;
        let cols = [];
        let c = _this.t.find('thead tr th');
        $.each(c,function(k,v){
            cols.push(v.innerHTML);
        });
        return cols;
    }

    buttonCreate(_this){
        let btn = $('<button>',{
            id:"dt-btn-search-"+_this.id,
            type:"button",
            class:"btn btn-primary mb-1 mb-md-0",
            title:"Create",
            text:" Create"
        })
        .prepend($('<i>',{class:"fal fa-plus-circle"}))

        // Event Listeners
        btn.on('click',function(){
            window.location.href = _this.options.linkCreate;
        });

        return btn;
    }

    buttonSearch(_this){
        // Set id of form search wrapper
        let fsearchWrapper = _this.handlerWrapper.find('.dt-form-search-wrapper');
        fsearchWrapper.attr('id','dt-search-collapse-'+_this.id);

        let btn = $('<button>',{
            id:"dt-btn-search-"+_this.id,
            type:"button",
            class:"btn btn-dark mb-1 mb-md-0",
            title:"Advanced Search",
            'data-toggle':"collapse",
            'data-target':"#dt-search-collapse-"+_this.id
        })
        .append($('<i>',{class:"fal fa-search"}))

        // Event Listeners
        _this.handlerWrapper.find('.dt-form-search').on('submit',function(e){
            e.preventDefault();
            _this.dtHandler.draw();

        });

        _this.handlerWrapper.find('.dt-form-search').on('reset',function(e){
            e.preventDefault();
            $(this).find('.form-control').val('');
            _this.dtHandler.draw();
        });

        return btn;
    }

    buttonFilter(_this){
        let btn = $('<div>',{class:"dropdown d-inline"})
        .append($('<button>',{
            id:"dt-btn-filter-"+_this.id,
            type:"button",
            class:"btn btn-dark mb-1 mb-md-0 dropdown-toggle",
            title:"Filter",
            'data-toggle':"dropdown",
            'aria-haspopup':true,
            'aria-expanded':false
        }).append($('<i>',{class:"fal fa-filter"}))
        )
        .append($('<div>',{
                class:"dropdown-menu dropdown-menu-right",
                'aria-labelledby':"dt-btn-filter-"+_this.id,
            })
            .append($('<div>',{class:"dropdown-header",text:"Filter Records"}))
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item active",text:" Active"})
                .prepend($('<input>',{type:"radio",name:"dt-filter-item-"+_this.id,value:"Active",class:"d-none",checked:true}))
                .prepend($('<i>',{class:"fal fa-flag"}))
            )
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item",text:" Trashed"})
                .prepend($('<input>',{type:"radio",name:"dt-filter-item-"+_this.id,value:"Trashed",class:"d-none"}))
                .prepend($('<i>',{class:"fal fa-trash-alt"}))
            )
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item",text:" All"})
                .prepend($('<input>',{type:"radio",name:"dt-filter-item-"+_this.id,value:"All",class:"d-none"}))
                .prepend($('<i>',{class:"fal fa-list"}))
            )
        );

        // Event Listeners
        btn.on('click',".dropdown-item",function(e){
            e.stopPropagation();
            btn.find('.dropdown-item.active').removeClass('active').children('input[type=radio]').attr('checked',false);
            $(this).addClass('active').children('input[type=radio]').attr('checked',true);
            _this.dtHandler.draw();
        });

        return btn;
    }

    buttonColvis(_this){
        let cols = _this.getColumns();

        let dropdown = $('<div>',{
            class:"dropdown-menu dropdown-menu-right",
            'aria-labelledby':"dt-btn-colvis-"+_this.id,
        })
        .append($('<div>',{class:"dropdown-header",text:"Toggle Columns"}));

        $.each(cols,function(k,v){
            dropdown
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item",text:" "+v})
                .prepend($('<input>',{type:"checkbox",name:"dt-colvis-item-"+_this.id+"[]",value:k,class:"dt-colvis-item d-none",checked:true}))
                .prepend($('<i>',{class:"fal fa-check-square"}))
            )
        });

        let btn = $('<div>',{class:"dropdown d-inline"})
        .append($('<button>',{
            id:"dt-btn-colvis-"+_this.id,
            type:"button",
            class:"btn btn-dark mb-1 mb-md-0 dropdown-toggle",
            title:"Columns Visibility",
            'data-toggle':"dropdown",
            'aria-haspopup':true,
            'aria-expanded':false
        }).append($('<i>',{class:"fal fa-columns"}))
        )
        .append(dropdown);


        // Event Listeners
        btn.on('click',".dropdown-item",function(e){
            e.stopPropagation();

            let check = $(this).children('input[type="checkbox"]');

            if(check.is(':checked')){
                check.attr('checked',false);
            }else{
                check.attr('checked',true);
            }

            let column  = _this.dtHandler.column(check.val());

            column.visible( ! column.visible() );

            $(this).find('.fal').toggleClass('fa-square');

        });

        return btn;
    }

    buttonExport(_this){
        let btn = $('<div>',{class:"dropdown d-inline"})
        .append($('<button>',{
            id:"dt-btn-export-"+_this.id,
            type:"button",
            class:"btn btn-dark mb-1 mb-md-0 dropdown-toggle",
            title:"Export",
            'data-toggle':"dropdown",
            'aria-haspopup':true,
            'aria-expanded':false
        }).append($('<i>',{class:"fal fa-external-link-alt"}))
        )
        .append($('<div>',{
                class:"dropdown-menu dropdown-menu-right",
                'aria-labelledby':"dt-btn-export-"+_this.id,
            })
            .append($('<div>',{class:"dropdown-header",text:"Export Data"}))
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item dt-export-copy",text:" Copy",'data-id':"copy"})
                .prepend($('<i>',{class:"fal fa-file"}))
            )
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item dt-export-csv",text:" Csv",'data-id':"csv"})
                .prepend($('<i>',{class:"fal fa-file-alt"}))
            )
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item dt-export-excel",text:" Excel",'data-id':"excel"})
                .prepend($('<i>',{class:"fal fa-file-excel"}))
            )
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item dt-export-pdf",text:" Pdf",'data-id':"pdf"})
                .prepend($('<i>',{class:"fal fa-file-pdf"}))
            )
            .append($('<a>',{href:"javascript:void(0);",class:"dropdown-item dt-export-print",text:" Print",'data-id':"print"})
                .prepend($('<i>',{class:"fal fa-print"}))
            )
        );

        let dtButton = {
            copy:{
                extend: 'copy',
                exportOptions:{
                    columns: _this.getExportColumns()
                }
            },
            csv:{
                extend: 'csv',
                exportOptions:{
                    columns: _this.getExportColumns()
                }
            },
            excel:{
                extend: 'excel',
                exportOptions:{
                    columns: _this.getExportColumns()
                }
            },
            pdf:{
                extend: 'pdf',
                exportOptions:{
                    columns: _this.getExportColumns()
                }
            },
            print:{
                extend: 'print',
                exportOptions:{
                    columns: _this.getExportColumns()
                },
                customize: function ( win ) {
                    $(win.document.body)
                        .css( 'font-size', '10pt' );

                    $(win.document.body).find( 'table' )
                        .addClass( 'table-sm' )
                        .css( 'width', '100%' )
                        .css( 'font-size', 'inherit' );
                }
            }
        };

        // Event Listeners
        btn.on('click',".dropdown-item",function(e){
            e.stopPropagation();


            _this.dtHandler.buttons('.buttons-'+$(this).attr("data-id")).remove();

            dtButton[$(this).attr("data-id")]['exportOptions']['columns'] = _this.getExportColumns();

            new $.fn.dataTable.Buttons( _this.dtHandler, {
                buttons:[
                    dtButton[$(this).attr("data-id")]
                ]
            });


            _this.dtHandler.buttons().container().prependTo(
                _this.dtHandler.table().container()).addClass('d-none');


            _this.dtHandler.button('.buttons-'+$(this).attr('data-id')).trigger();
        });

        return btn;
    }

    buttonRefresh(_this){
        let btn = $('<button>',{
            id:"dt-btn-refresh",
            type:"button",
            class:"btn btn-dark mb-1 mb-md-0",
            title:"Refresh Data"
        })
        .append($('<i>',{class:"fal fa-redo-alt"}))

        // Event Listeners
        btn.on('click',function(e){
            _this.dtHandler.draw();
        });

        return btn;
    }

    getButtons(){
        let _this = this;
        $.each(_this.options.buttons,function(k,v){
            if (typeof _this["button"+v[0].toUpperCase()+v.slice(1)] == "function"){
                _this.handlerWrapper.find('.dt-buttons-wrapper')
                    .append(_this["button"+v[0].toUpperCase()+v.slice(1)](_this))
                    .append($('<span>',{html:"&nbsp;"}));
            }
        });
    }

    setFormTrashHandler(){
        let _this = this;
        return new FormAjax(_this.formTrash,{
            callbackFunction: function(data){
               _this.dtHandler.ajax.reload();
            }
        });
    }

    setFormTrash(){
        let _this = this;
        let form = $('<form>',{id:"dt-form-trash-"+_this.id,role:"form",method:"POST"});

        if(_this.options.laravelTrash){
            $.each(_this.options.laravelFields,function(k,v){
                form.append($('<input>',{type:v.type,name:v.name,value:v.value}));
            });
        }
        $.each(_this.options.trashFields,function(k,v){
            form.append($('<input>',{type:v.type,name:v.name,value:v.value}));
        });

        $('body').append(form);
        return form;
    }

    setLaravelLinks(){
        let _this = this;
        let linkIndex = _this.options.laravelLink;
        if(_this.options.linkIndex == ''){
            _this.options.linkIndex = linkIndex;
        }
        _this.options.linkCreate = linkIndex+"/create";
        _this.options.linkStore = linkIndex;
        _this.options.linkView = linkIndex+"/{id}";
        _this.options.linkEdit = linkIndex+"/{id}/edit";
        _this.options.linkUpdate = linkIndex+"/{id}";
        _this.options.linkDelete = linkIndex+"/{id}";
        _this.options.linkRestore = linkIndex+"/{id}/restore";
    }

    setLink(link,id){
        return link.replace("{id}",id);
    }

    setActions(){
        let _this = this;

        // Event Listeners

        // View
        _this.t.on('click','.dt-btn-view',function (e) {
            e.preventDefault();

            $.ajax({
                url : _this.setLink(_this.options.linkView,$(this).attr('data-id')),
                type: "GET",
                dataType: 'JSON',
                success: function (response) {
                    if(response.status === 'Success'){
                        let data = response.data;
                        let fields = data.fields;
                        let html = data.html;
                        let images = data.images;
                        $.each(fields,function (k,v) {
                            _this.options.viewModal.find(".dt-view-field[data-id="+k+"]").text(v);
                        });
                        $.each(html,function (k,v) {
                            _this.options.viewModal.find(".dt-view-html[data-id="+k+"]").html(v);
                        });
                        $.each(images,function (k,v) {
                            _this.options.viewModal.find(".dt-view-img[data-id="+k+"]").attr('src',v);
                        });
                        _this.options.viewModal.modal();
                    }
                },
                error: function (response){
                    console.log(response.responseText);
                }
            });

        });

        // Edit
        _this.t.on('click','.dt-btn-edit',function (e) {

            e.preventDefault();

            let url = _this.setLink(_this.options.linkEdit,$(this).attr('data-id'));

            window.location.href = url;

        });

        // Trash
        _this.t.on('click','.dt-btn-trash',function (e) {

            e.preventDefault();

            _this.formTrashHandler.url = _this.setLink(_this.options.linkDelete,$(this).attr('data-id'));

            _this.formTrashHandler.method = 'POST';

            _this.formTrashHandler.formTarget.submit();

        });

        // Restore
        _this.t.on('click','.dt-btn-restore',function (e) {
            e.preventDefault();

            _this.formTrashHandler.url = _this.setLink(_this.options.linkRestore,$(this).attr('data-id'));

            _this.formTrashHandler.method = 'GET';

            _this.formTrashHandler.formTarget.submit();

        });

    }

    getExportColumns(){
        let _this = this;
        var val = [];
        $.each($('.dt-colvis-item:checked'),function(k,v){
          val[k] = $(v).val();
        });
        return val;
    }

    initDataTable(){
        let _this = this;

        let dtRetry = 0;

        let initialOptions = {
            responsive: true,
            processing: true,
            serverSide: true,
            ajax: {
                url: _this.options.linkIndex,
                method: 'POST',
                data: function (d) {
                    // Filter
                    let f = $('[name=dt-filter-item-'+_this.id+']:checked');
                    if(f.length > 0){
                        d.filter = $('[name=dt-filter-item-'+_this.id+']:checked').val();
                    }else{
                        d.filter = 'Active';
                    }
                    // Search field values
                    let searchFields = _this.handlerWrapper.find('.dt-form-search .dt-search-field');
                    $.each(searchFields,function(k,v){
                        d[$(v).attr('name')] = $(v).val();
                    });
                },
                error:function(d){
                    console.log(d.responseText);
                    dtRetry++;
                    if(dtRetry <= 2){
                        _this.dtHandler.ajax.reload();
                    }else{
                        alert('Something went wrong refresh your browser.');
                    }
                }
            },
            dom:"<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5 dt-clone-info'i><'col-sm-12 col-md-7'p>>"+
                "<'d-none'B>",
            drawCallback: function(settings,json){
                if(_this.handlerWrapper.find('.dt-form-search-info').length > 0){
                    _this.handlerWrapper.find('.dt-form-search-info')
                        .html(_this.handlerWrapper.find('.dt-clone-info').html());
                }
            }
        }

        let options = _this.setDefaults(_this.datatableOptions,initialOptions);

        return _this.t.DataTable(options);
    }

    reloadDataTable(){
        var _this = this;
        _this.dtHandler.ajax.reload;
    }

    initHandler(){
        let _this = this;

        if(_this.options.laravelLink !== ''){
            _this.setLaravelLinks();
        }

        // Clone Footer
        if(_this.options.cloneFooter){
            _this.cloneFooter();
        }

        // init Datatables
        _this.dtHandler = _this.initDataTable();


        if(_this.options.enableFormTrash){
            _this.formTrash = _this.setFormTrash();
            _this.formTrashHandler = _this.setFormTrashHandler();
        }

        _this.getButtons();
        _this.setActions();
    }


};
