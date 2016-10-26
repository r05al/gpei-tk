$(() => {
  $('#CMS_assets_link').click(e => {
    e.preventDefault()
  })

  // $('#CMS_index_content').on('click', '#add_reference_link_input', e => {
  //   e.preventDefault()
  //   $(e.currentTarget.parentElement.parentElement).after(getReferenceLinkField())
  //   return false
  // })
  function toggleProgressSpinner(){
    if ($('#progress_spinner').css('visibility') === 'hidden')
      $('#progress_spinner').css('visibility', 'visible')
    else
      $('#progress_spinner').css('visibility', 'hidden')
  }

  /*   REFERENCE LINKS   */

  $('#CMS_references_link').click(e => {
    e.preventDefault()
    toggleProgressSpinner()
    $.ajax({
      method: 'GET',
      url: '/cms/reference_links/'
    }).done(response => {
      let reference_links = response.reference_links
      let reference_link_categories = response.reference_link_categories
      $.ajax({
        method: 'GET',
        url: '/cms/users/'
      }).done(response => {
        toggleProgressSpinner()
        $('#CMS_index_content').empty()
        // appendReferenceLinkHeader()
        // appendReferenceLinkRows(reference_links, reference_link_categories, response.users)
        $('#CMS_index_content').append(getReferenceLinkGrid(reference_links, reference_link_categories, response.users))
        loadIsotopeHandlers()
      })
    })
  })

  function loadIsotopeHandlers(){
    $('#CMS_index_content #cms_reference_link_grid').isotope({
      itemSelector: '.reference_link_item',
      layoutMode: 'fitRows'
    })
    $('.filter-button-group').on('click', 'button', function() {
      var filterValue = $(this).attr('data-filter')
      // use filter function if value matches
      $('#CMS_index_content #cms_reference_link_grid').isotope({ filter: filterValue })
    })
    $('.button-group').each( function( i, buttonGroup ) {
      var $buttonGroup = $( buttonGroup )
      $buttonGroup.on( 'click', 'button', function() {
        $buttonGroup.find('.is-checked').removeClass('is-checked')
        $( this ).addClass('is-checked')
      })
    })
  }

  function getReferenceLinkGrid(reference_links, reference_link_categories, users){
    return `<div id='cms_reference_links_filter_menu' class="button-group filter-button-group col-md-11">
              <button data-filter="*" class='button is-checked'>show all</button>
              <button data-filter=".Understand" class='button'>Understand</button>
              <button data-filter=".Plan" class='button'>Plan</button>
              <button data-filter=".Act" class='button'>Act</button>
              <button data-filter=".Tools" class='button'>Tools</button>
              <button data-filter=".Unassigned" class='button'>Unassigned</button>
            </div>
            <div id="cms_reference_link_grid" class='col-md-11'>
            ${ _.map(reference_links, reference_link => {
                return `<div id="${reference_link.id}" class="col-md-12 reference_link_item ${_.isUndefined(reference_link_categories[reference_link.id]) ? 'Unassigned' : _.map(reference_link_categories[reference_link.id], link => { return link.category }).join(" ") }">
                    <div class='col-md-4'>
                      <div id='reference_link_list_name_td' class='col-md-12'>
                        <div id='${ reference_link.id }' class='col-md-12'>
                          <a id='cms_reference_link_icon' href="${ reference_link.absolute_url }" target='_blank'><i class="fa fa-search" aria-hidden="true"></i> <strong>Preview</strong></a>
                          <div><strong>Title:</strong> <div id='cms_reference_link_title_div'>${!_.isNull(reference_link.title) ? reference_link.title : 'No title given' }</div></div>
                          <div style='height:10px' class='col-md-12'></div>
                          <div class='col-md-12'><strong>File name:</strong> <div id='cms_reference_link_file_name_div'>${ reference_link.document_file_name }</div></div>
                        </div>
                        <div style='height:10px' class='col-md-12'></div>
                        <div class='col-md-12'>
                          <div class='col-md-12'>Description:</div>
                          <div id='cms_reference_link_description_div' class='col-md-12'>${!_.isNull(reference_link.description) ? reference_link.description : 'Description coming soon'}</div>
                        </div>
                        <div style='height:10px' class='col-md-12'></div>
                      </div>
                    </div>
                    <div class='col-md-2'><strong>Categories:</strong><br> ${ _.isUndefined(reference_link_categories[reference_link.id]) ? '' : _.map(reference_link_categories[reference_link.id], reference_link_categories => { return reference_link_categories.details }).join("<div style='height:2px;background:black;width:100%'></div>")}</div>
                    <div class='col-md-1 text-center'><strong>Language:</strong><br> ${reference_link.language}</div>
                    <div class='col-md-1'><strong>Updated:</strong><br> ${moment(reference_link.updated_at, "YYYY-MM-DD").format("MMM DD, YYYY")}</div>
                    <div class='col-md-1'><strong>Created:</strong><br> ${moment(reference_link.created_at, "YYYY-MM-DD").format("MMM DD, YYYY")}</div>
                    <div id='cms_author_div' class='col-md-2'><strong>Author:</strong><br> ${users[reference_link.author_id].first_name + ' ' + users[reference_link.author_id].last_name}</div>
                    <div class='col-md-1'><a id='reference_link_delete' href=''><i class="fa fa-times" aria-hidden="true"></i> delete</a></div>
                    <div id='${reference_link.id}' class='col-md-3 bottom-right-position'><a id='cms_reference_link_edit' href="${ reference_link.absolute_url }"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>Edit</a></div>
                  </div>`}).join('')}
              </div>`
  }
  $('#CMS_references_link_upload').click(e => {
    e.preventDefault()
    toggleProgressSpinner()
    let content = formForReferenceLinkUpload()
    $('#CMS_index_content').empty()
    $('#CMS_index_content').append(content)
    toggleProgressSpinner()
  })

  $('#CMS_index_content').on('submit', '#CMS_reference_link_upload_form', e => {
    e.preventDefault()
    // let formData = new FormData($(e.currentTarget)[0])
    let formData = new FormData()
    $.each($("input[type=file]")[0].files, (idx, file) => {
      formData.append('reference_link['+idx+']', file);
    })
    formData.append('language', $('#CMS_reference_link_upload_form').find('select')[0].value)
    $('#CMS_reference_link_upload_form button').prop('disabled', true)
    toggleProgressSpinner()
    $.ajax({
      method: 'POST',
      cache: false,
      contentType: false,
      processData: false,
      url: 'cms/reference_links/',
      data: formData
    }).done(response => {
      toggleProgressSpinner()
      $('#CMS_reference_link_upload_form button').prop('disabled', false)
      if (response.status === 403){
        alert(response.error)
      } else {
        $('#CMS_references_link_upload').click()
        showDimmerClearBrowser()
      }
    })
    return false
  })

  function showDimmerClearBrowser() {
    $('.ui.dimmer').dimmer('show')
    _.delay(() => {
      $('.ui.dimmer').dimmer('hide')
    }, 3000, 'later');
    history.pushState({}, null, 'cms');
  }
  function getReferenceLinkField() {
    // <i class="fa fa-plus" aria-hidden="true"></i>
    return (`
      <div class="field">
        <label>Reference Link<a id="add_reference_link_input"  href=''></a></label>
        <input class="reference_link_file" type="file" name="reference_link[]" value="" multiple>
      </div>
    `)
  }

  function formForReferenceLinkUpload() {
    return (`
      <form id="CMS_reference_link_upload_form" class="ui form CMS_c4d_article_form_div">
        ${getLanguageDropdown()}
        ${getReferenceLinkField()}
        <button class="ui button" type="submit">Submit</button>
      </form>
      `)
  }

  function appendReferenceLinkHeader(){
    $('#CMS_index_content').append('<table id="CMS_reference_link_table" class="ui celled table"></table>')
    $('#CMS_reference_link_table').append(`<thead>
                                              <tr>
                                                <th class="text-center"> Name </th>
                                                <th class="text-center"> Categories + Order Id </th>
                                                <th class="text-center"> Language </th>
                                                <th class="text-center"> Updated </th>
                                                <th class="text-center"> Created </th>
                                                <th class="text-center"> Author </th>
                                                <th class="text-center"> Action </th>
                                              </tr>
                                            </thead>`)
  }
  $('#CMS_index_content').on('click', '#reference_link_delete', e => {
    e.preventDefault()
    let answer = confirm('This will permanently delete the reference link. Do you wish to continue?')
    if (answer){
      toggleProgressSpinner()
      $.ajax({
        method: 'DELETE',
        url: '/cms/reference_links/' + e.currentTarget.parentElement.parentElement.id
      }).done(response => {
        toggleProgressSpinner()
        $('#CMS_references_link').trigger('click')
      })
    }
  })
  function appendReferenceLinkRows(reference_links, reference_link_categories, users){
    _.forEach(reference_links, reference_link => {
      let row = `<tr id="${reference_link.id}">
                  <td>
                    <div id='reference_link_list_name_td' class='col-md-12'>
                      <div id='${ reference_link.id }' class='col-md-12'>
                        <a id='cms_reference_link_icon' href="${ reference_link.absolute_url }" target='_blank'><i class="fa fa-search" aria-hidden="true"></i> Preview</a>
                        <div>Title: <div id='cms_reference_link_title_div'>${!_.isNull(reference_link.title) ? reference_link.title : 'No title given' }</div></div>
                        <div style='height:10px' class='col-md-12'></div>
                        <div class='col-md-12'>File name: <div id='cms_reference_link_file_name_div'>${ reference_link.document_file_name }</div></div>
                      </div>
                      <div style='height:10px' class='col-md-12'></div>
                      <div class='col-md-12'>
                        <div class='col-md-12'>Description:</div>
                        <div id='cms_reference_link_description_div' class='col-md-12'>${!_.isNull(reference_link.description) ? reference_link.description : 'Description coming soon'}</div>
                      </div>
                      <div style='height:10px' class='col-md-12'></div>
                      <div id='${reference_link.id}' class='col-md-3 bottom-right-position'><i class="fa fa-pencil-square-o" aria-hidden="true"></i><a id='cms_reference_link_edit' href="${ reference_link.absolute_url }">Edit</a></div>
                    </div>
                  </td>
                  <td>${ _.isUndefined(reference_link_categories[reference_link.id]) ? '' : _.map(reference_link_categories[reference_link.id], reference_link_categories => { return reference_link_categories.details }).join("<div style='height:2px;background:black;width:100%'></div>")}</td>
                  <td>${reference_link.language}</td>
                  <td>${moment(reference_link.updated_at, "YYYY-MM-DD").format("MMM DD, YYYY")}</td>
                  <td>${moment(reference_link.created_at, "YYYY-MM-DD").format("MMM DD, YYYY")}</td>
                  <td id='cms_author_td'>${users[reference_link.author_id].first_name + ' ' + users[reference_link.author_id].last_name}</td>
                  <td><a id='reference_link_delete' href=''><i class="fa fa-times" aria-hidden="true"></i> delete</a></td>
                </tr>`
      $('#CMS_reference_link_table').append(row)
    })
  }
  $('#CMS_index_content').on('click', '#cms_reference_link_edit', e => {
    e.preventDefault()
    toggleProgressSpinner()
    $('#CMS_modal').modal('show')
    $('#CMS_modal #CMS_modal_header').append("<h3>Update reference link</h3>")
    let title = $('#CMS_index_content #' + e.currentTarget.parentElement.id + ' #cms_reference_link_title_div').text()
    let description = $('#CMS_index_content #' + e.currentTarget.parentElement.id + ' #cms_reference_link_description_div').text()
    let file_name = $('#CMS_index_content #' + e.currentTarget.parentElement.id + ' #cms_reference_link_file_name_div').text()
    // $('#CMS_index_content').empty()
    let content = getReferenceLinkEditForm(title,
                                          $(e.currentTarget).attr('href'),
                                            e.currentTarget.parentElement.id,
                                            description,
                                            file_name)
    $('#CMS_modal #CMS_modal_content').append(content)
    // $('#CMS_index_content').append(content)
    toggleProgressSpinner()
    return false
  })

  function getReferenceLinkEditForm(reference_link_title, url, id, description, file_name){
    return `<div id='${id}'>
              <form id="CMS_reference_link_edit" class="ui form">
                <div class="field">
                  <label>
                    <h4>
                      <a id='' href="${ url }" target='_blank'>
                        <i class="fa fa-search" aria-hidden="true"></i>
                      </a>
                      File name: ${ file_name }
                      <br>
                      Title:
                    </h4>
                  </label>
                  <input class="reference[title]" type="text" placeholder="No title" name="reference_link[title]" value="${ (_.isNull(reference_link_title) || reference_link_title === '' || reference_link_title === 'No title given') ? '' : reference_link_title }" style='margin-bottom:5px' required>
                  <label>Description:</label>
                  <textarea name="reference_link[description]" placeholder="descriptive text" required>${ (_.isNull(description) || description === '' || description === 'Description coming soon') ? '' : description }</textarea>
                </div>
                <button class="ui button" type="submit">Submit</button>
              </form>
            </div>`
  }
  $('#CMS_modal').on('submit', '#CMS_reference_link_edit', e => {
    e.preventDefault()
    toggleProgressSpinner()
    let target = e.currentTarget
    $.ajax({
      method: 'PATCH',
      url: '/cms/reference_links/' + e.currentTarget.parentElement.id,
      data: $(e.currentTarget).serialize()
    }).done(response => {
      $('#CMS_modal').modal('hide')
      toggleProgressSpinner()
      $('#cms_reference_link_grid #'+response.id+'.reference_link_item').find('#cms_reference_link_title_div').text(response.title)
      $('#cms_reference_link_grid #'+response.id+'.reference_link_item').find('#cms_reference_link_description_div').text(response.description)
    })
    return false
  })
  function getLanguageDropdown(){
    return (`
      <div class="field">
        <label>Language</label>
        <select name="reference_link[language]" class="ui dropdown cms_dropdown_select" required>
          <option value="">Select Language</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="other">Other</option>
        </select>
      </div>
    `)
  }

    /*   EMBEDDED IMAGES LINKS   */
  $('#CMS_embedded_images_link').click(e => {
    e.preventDefault()
  })

  $('#CMS_embedded_images_link_upload').click(e => {
    e.preventDefault()
    toggleProgressSpinner()
    $.ajax({
      method: 'GET',
      url: 'cms/c4d_articles/'
    }).done(response => {
      toggleProgressSpinner()
      let content = formForEmbeddedImagesUpload(response.c4d_articles)
      $('#CMS_index_content').empty()
      $('#CMS_index_content').append(content)
    })
  })

  $('#CMS_index_content').on('submit', '#CMS_embedded_image_upload_form', e => {
    e.preventDefault()
    let formData = new FormData($(e.currentTarget)[0])
    toggleProgressSpinner()
    $.ajax({
      method: 'POST',
      cache: false,
      contentType: false,
      processData: false,
      url: 'cms/embedded_images/',
      data: formData
    }).done(response => {
      toggleProgressSpinner()
      showDimmerClearBrowser()
      $('#CMS_embedded_images_link_upload').click()
    })
    return false
  })

  function formForEmbeddedImagesUpload(c4d_articles){
    return (`
      <form id="CMS_embedded_image_upload_form" class="ui form CMS_c4d_article_form_div">
        ${getC4dArticleDropdown(c4d_articles)}
        ${getEmbeddedImageField()}
        <button class="ui button" type="submit">Submit</button>
      </form>
      `)
  }
  function getC4dArticleDropdown(c4d_articles){
    return (`
      <div class="field">
        <label>C4D Article</label>
        <select name="embedded_image[article_id]" class="ui dropdown cms_dropdown_select" required>
          <option value="">Select Article</option>
          ${_.map(c4d_articles, article => {
            return `<option value="${article.id}">Order ID:${article.order_id} Title: ${article.title}</option>`
          }).join('\n')}
        </select>
      </div>
    `)
  }

  function getEmbeddedImageField(){
    // <i class="fa fa-plus" aria-hidden="true"></i>
    return (`
      <div class="field">
        <label>Embedded Image<a id="add_embedded_images_input"  href=''></a></label>
        <input class="embedded_image_file" type="file" name="embedded_image[image]" value="">
      </div>
    `)
  }
})