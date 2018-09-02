(function () {

  const Debug_Mode = true;
  const BASE_URL = window.location.origin;
  const API_URL = BASE_URL + '/record';
  function preventReload(e) {
    if (Debug_Mode) {
      e.preventDefault();
    }
  }

  function getPostInputData() {
    const itemThing = $('#post-item-thing').val();
    const itemMemo = $('#post-item-memo').val();

    return {
      'thing': itemThing,
      'memo': itemMemo,
    }
  }
  // 監聽
  $('#post-form').submit(function (e) {
    // prevent auto reload the page after sending request
    preventReload(e)
    const inputData = getPostInputData();
    // check inputData is valid
    if (inputData) {
      // create new record
      postItemToServer(inputData);
    }
  });

  function newElement() {
    var li = document.createElement("li");
    var inputValue = document.getElementById("post-item-thing").value;
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') {
      alert("做事好ㄇ。");
    } else {
      document.getElementById("item-lists").appendChild(li);
    }
    document.getElementById("post-item-thing").value = "";

  }

  function postItemToServer(inputData) {
    $.ajax({
      url: API_URL,
      method: 'POST',
      data: inputData,
      success: function (data) {
        console.log(data);
        newElement();
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
      }
    });
  }


  // GET
  function getItemFromServer() {
    $.ajax({
      url: API_URL,
      method: 'GET',
      success: function (data) {
        loadAccountData(data)
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
      }
    });
  }

  // getItemsFromServer()

  function generateDataHtml(data) {
    let elementsHtml = '';
    for (item of data) {
      console.log(item)
      var checkClass = ''
      
      if (item['check'] === '2') {
        console.log('tyttyttt')
        checkClass = 'checked'
      }
      const element =
        `
          <li data-record-id="${item['id']}" class="list-group-item ${checkClass}">
            <span class="item-thing">${item['thing']}</span>
            <span data-record-memo="${item['memo']}" class="item-memo">${item['memo']}</span> 

          </li>`;
      elementsHtml += element;
    }
    return elementsHtml;
  }

  function loadAccountData(data) {
    const dataHtml = generateDataHtml(data);
    $('#item-lists').append(dataHtml);
    init();
  }


  function showEditForm(recordId) {
    const recordElement = $(`.list-group-item[data-record-id=${recordId}]`);
    const oldName = recordElement.find('.item-thing').text()
    const oldCost = recordElement.children('.item-memo').attr('data-record-memo')
    const formHtml
      = `
          <form data-record-id="${recordId}" id="put-form" class="d-flex justify-content-between align-items-center">
              <div class="input-group">
                  <button data-record-id="${recordId}" class="btn btn-link btnCancel">X</button>
                  <div class="input-group-prepend">
                      <span class="input-group-text">Thing</span>
                  </div>
                  <input data-record-old-thing="${oldName}" pattern=".{1,}" required title="1 characters minimum" type="text" aria-label="name" class="form-control" id="put-item-thing" value=${oldName}>
                  <div class="input-group-prepend">
                      <span class="input-group-text">Memo</span>
                  </div>
                  <input data-record-old-memo="${oldCost}" pattern=".{1,}" required title="1 number minimum" type="text" aria-label="Cost" class="form-control" id="put-item-memo" value=${oldCost}>
                  <button class="btn btn-link" type='submit'>Update</button>
              </div>
          </form>`;
    recordElement.html(formHtml);
    // Prevent Double click the li again
    recordElement.addClass('on-edit')
  }


  function cancelEditForm(recordId) {
    console.log(recordId)
    const recordElement = $(`.list-group-item[data-record-id=${recordId}]`);
    const oldThing = recordElement.find('#put-item-thing').attr('data-record-old-thing');
    const oldMemo = recordElement.find('#put-item-memo').attr('data-record-old-memo');
    console.log(oldMemo)
    const element =
    `
    <span class="item-thing">${oldThing}</span>
    <span data-record-memo=${oldMemo} class="item-memo">${oldMemo}</span> 

    `;
    recordElement.html(element);
    recordElement.removeClass('on-edit')
  }


  function getPutInputData(recordId) {
    const recordElement = $(`.list-group-item[data-record-id=${recordId}]`);
    console.log(recordElement)
    const newThing = recordElement.find('#put-item-thing').val();
    const newMemo = recordElement.find('#put-item-memo').val();
    return {
      id: recordId,
      thing: newThing,
      memo: newMemo,
    }
  }

  function sendEditItemRequest(recordId) {
    const inputData = getPutInputData(recordId);
    $.ajax({
      url: `${API_URL}/${inputData['id']}`,
      method: 'PUT',
      data: inputData,
      success: function (data) {
        console.log(data);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
      }
    });
  }


  function sendRemoveItemRequest(recordId) {
    $.ajax({
      url: `${API_URL}/${recordId}`,
      method: 'DELETE',
      success: function (data) {
        console.log(data);
        if (!Debug_Mode) {
          location.reload();
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
      }
    });
  }

  getItemFromServer()

  /**
   * Listen: Double Click Event (Edit a old record)
   */
  $("body").delegate(".list-group-item:not(.on-edit)", "dblclick", function (e) {
    const recordId = $(this).attr('data-record-id');
    // Prevent DBClick the example one
    if (recordId) {
      showEditForm(recordId)
    }
  });



  /**
   * Listen: Remove icon Click event (Remove a old record)
   * Delegate Intro: http://jsgears.com/thread-402-1-1.html
   * Because the li elements is generated by js, we need to use delegate to bind all the remove buttons.
   */
  $("body").delegate(".close", "click", function (e) {
    const recordId = $(this).parent().attr('data-record-id');
    sendRemoveItemRequest(recordId);
  });

  /**
   * Listen: Click Event (Cancel Update Record)
   */
  $("body").delegate(".btnCancel", "click", function (e) {
    const recordId = $(this).attr('data-record-id');
    cancelEditForm(recordId)
  });
  /**
   * Listen: Click Event (Send Update Record Request)
   */
  $("body").delegate("#put-form", "submit", function (e) {
    // prevent auto reload the page after sending request
    preventReload(e)
    const recordId = $(this).attr('data-record-id');
    console.log(recordId)
    sendEditItemRequest(recordId);
  });




  var i;

  function closeBtn() {
    var myNodelist = document.getElementsByTagName("li");
    for (i = 0; i < myNodelist.length; i++) {
      var span = document.createElement("span");
      var txt = document.createTextNode("\u00D7");
      span.className = "close";
      span.getAttribute(" data-record-id='21' ") //把id放到atrribute
      span.appendChild(txt);
      myNodelist[i].appendChild(span);
    }

  }

  function closeElement() {
    var close = document.getElementsByClassName("close");
    for (i = 0; i < close.length; i++) {
      close[i].onclick = function () {
        var div = this.parentElement;
        div.style.display = "none";
        
      }
    }
  }

  function sendCheck(isCheck, id) {
    console.log(isCheck)
    $.ajax({
      url: `${API_URL}/${id}`,
      method: 'PUT',
      data: {
        check: isCheck,
      },
      success: function (data) {
        console.log(data);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr.status); 
        console.log(thrownError);
      }
    });
  }

  function ifChecked() {
    var list = document.querySelector('ul');
    list.onclick = function (ev) {
      if (ev.target.tagName === "LI" && ev.target.classList[1] !== 'on-edit') {
        ev.target.classList.toggle("checked");
        //console.log(ev.target.classList.length)
        var isCheck = ev.target.classList.length;
        var record_id = ev.target.getAttribute("data-record-id")
        sendCheck(isCheck, record_id)
      }
    }
  }

  function initList() {

    closeBtn();
    closeElement();
    ifChecked();

  }
  function init() {
    var addButton = document.getElementById("addButton");
    initList();

    addButton.onclick = function () {
      initList();
    }

    // document.onkeydown = function (event) {
    //   if (event.keyCode == 13) {
    //     newElement();
    //     initList();
    //   }
    // }
  }
})();


/* 案delete 刪掉
document.onkeydown = function(_a_delete) {
      if(_a_delete.keyCode == 12 ) {
        closeElement();
      }  
    }
*/