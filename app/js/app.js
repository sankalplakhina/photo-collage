/*
app.js - photo-collage-app
Developed by Sankalp Lakhina [ sankalp.lakhina91@gmail.com ]
*/

/*global document, alert, window,FileReader, $, XMLHttpRequest*/

(function () {
    
	// getElementById
	function $id(id) {
		return document.getElementById(id);
	}

	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}


	// file selection
	function FileSelectHandler(e) {

		// cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			ParseFile(f);
		}

	}


	// output file information
	function ParseFile(file) {

		// display an image
		if (file.type.indexOf("image") === 0) {
			var reader = new FileReader();
			reader.onload = function(e) {
				var imgStr = '<img src="' + e.target.result +'" alt="On top of Kozi kopka" width="96" height="72">';
                appendToGallery(imgStr);
			};
			reader.readAsDataURL(file);
		}        
        else {
            alert('Not an Image file. Please try again by adding an image file.');
        }

	}


	// initialize
	function Init() {

		var fileselect = $id("fileselect"),
			filedrag = $id("filedrag"),
			submitbutton = $id("submitbutton");

		// file select
		fileselect.addEventListener("change", FileSelectHandler, false);

		// is XHR2 available?
		var xhr = new XMLHttpRequest();
		if (xhr.upload) {

			// file drop
			filedrag.addEventListener("dragover", FileDragHover, false);
			filedrag.addEventListener("dragleave", FileDragHover, false);
			filedrag.addEventListener("drop", FileSelectHandler, false);
			filedrag.style.display = "block";

			// remove submit button
			submitbutton.style.display = "none";
		}

	}

	// call initialization file
	if (window.File && window.FileList && window.FileReader) {
		Init();
	}

/* ------------------------------  Photo Collage Functionalities ------------------------- */

    // global gallery and workspace objects
    var $gallery = $( "#gallery" ),
        $workspace = $( "#workspace" );

    
    // Remove the selection class from all the current workspace items
    function removeSelections () {
        $('.wrapper-div').rotatable('disable');
        $('.wrapper-div').find('.ui-rotatable-handle').hide();
        $('.wrapper-div').removeClass('ui-selected');
        $('.wrapper-div').addClass('ui-resizable-autohide');
    }

    
    // Recycle and add image to gallery when removed from Workspace
    function recycleImage( $item ) {

        $item.fadeOut(function() {
            appendToGallery($item.remove().html());
        });
    }
    
    // Wraps the new uploaded image or workspace deleted image and add to gallery list
    function appendToGallery(itemHtmlStr){

        var $liWrapper = $($gallery.find('li')[0]).clone();
        $liWrapper.html( itemHtmlStr ).appendTo( $gallery ).fadeIn();
        runBindings();
    }
    
    // returns the largest z-index value of item in Workspace
    function findLargestZIndex () {
        
        var zIndexArr = [];
        $.each( $('.wrapper-div'), function (index, value) {
          var $style = $(value).attr('style');                  
          if ( $style ){
              zIndexArr.push( Number($style.split('z-index: ')[1].split(';')[0]) );
          }
        });
        return Math.max.apply( null, zIndexArr );
    }
    

    // Wrap the image into div and append to workspace
    function wrapAppendImage( $item ) {

      $item.fadeOut(function() {

          var $wrapperDiv = $('<div class="wrapper-div" title="Click to select, double click to deselect this image."></div>');
         $wrapperDiv.zIndex( findLargestZIndex() + 1 ).append($item.find('img')).appendTo( $workspace ).fadeIn()
         .draggable({

              containment: $workspace,
              stack: $wrapperDiv,
              cursor: "move"
          })
         .resizable({
             animate:true,
             containment: $workspace,
             maxHeight: 300,
             maxWidth: 300,
             ghost: true,
             aspectRatio: false,
             handles: 'ne, se, sw, nw',
             autoHide: false
          })
         .rotatable()
         .on('click', function(){
             
             if ( $(this).zIndex() <= findLargestZIndex() ){
                 $(this).zIndex(findLargestZIndex() + 1);
             }
             removeSelections();
             $(this).rotatable('disable');
             $(this).find('.ui-rotatable-handle').show();
             $(this).addClass('ui-selected');
             $(this).removeClass('ui-resizable-autohide');
          })
         .on('dblclick', function(){

              removeSelections();
             $(this).addClass('ui-resizable-autohide');
          });
          removeSelections();

      });
    }


    // binding all drag and drop events
    function runBindings() {

        // let the gallery items be draggable
        $( "li", $gallery ).draggable({

          revert: "invalid", // when not dropped, the item will revert back to its initial position
          containment: "document",
          helper: "clone",
          cursor: "move"
        });

        // let the workspace be droppable, accepting the gallery items
        $workspace.droppable({

          accept: "#gallery > li",
          activeClass: "ui-state-highlight",
          drop: function( event, ui ) {
            wrapAppendImage( ui.draggable );
          }
        });

        // let the gallery be droppable as well, accepting items from the workspace
        $gallery.droppable({

          accept: "#workspace li",
          activeClass: "custom-state-active",
          drop: function( event, ui ) {
            recycleImage( ui.draggable );
          }
        });
    }

    runBindings();

    // binding keyup event to check for delete button press
    $('html').keyup(function(e){
        if( e.keyCode == 46 ) {

            var $itemToDelete = $('.ui-selected');
            if ( $itemToDelete.length > 0 ) {
                recycleImage( $itemToDelete );
            }
            else if ( $itemToDelete.length <= 0 ) {
                alert('Please select an image on Workspace to delete.');
            }
        }
        else{
            return;
        }

    });
    

})();