$(() => {
  $('#CMS_sop_articles_link').click(e => {
    e.preventDefault();
    $.ajax({
      method: 'GET',
      url: 'cms/sop_articles/'
    }).done(response => {
      $('#CMS_index_content').empty()
      appendSopArticleTableHeader()
      appendSopArticleRows(response.sop_articles, response.users)
    })
  })

  function getUserActionDropdown(id){
    return (
      '<div class="ui buttons"><div id="CMS_actions_dropdown" class="ui button">Actions</div><div class="ui floating dropdown icon button"><i class="dropdown icon"></i><div class="menu"><div id="' + id + '" class="item"><span id="CMS_user_assign_role">Assign Roles</span></div><div id="' + id + '" class="item"><span id="CMS_user_delete_user">Delete User</span></div></div></div>'
    );
  }

  function appendSopArticleTableHeader(){
    $('#CMS_index_content').append('<table id="CMS_sop_articles_table" class="ui celled table"></table>')
    $('#CMS_sop_articles_table').append('<thead><tr><th class="text-center"> ID </th><th class="text-center"> Title </th><th class="text-center"> Status </th><th class="text-center"> Updated </th><th class="text-center"> Created </th><th class="text-center"> Author </th><th class="text-center"></th></tr></thead>')
  }

  function appendSopArticleRows(sop_articles, users){
    _.forEach(sop_articles, article => {
      let row = '<tr id="' + article.id + '">' + '<td>' + article.order_id + '</td>' + '<td><a id="' + article.id + '" href="">' + article.title + '</td>' + '<td>' + formatPublished(article.published) + '</td>' + '<td>' + moment(article.updated_at, "YYYY-MM-DD").format("MMM DD, YYYY") + '</td>' + '<td>' + moment(article.created_at, "YYYY-MM-DD").format("MMM DD, YYYY") + '</td>' + '<td>' + users[article.author_id].first_name + ' ' + users[article.author_id].last_name + '</td>' + '<td>' + getUserActionDropdown(article.id) + '</td>' + '</tr>'
      $('#CMS_sop_articles_table').append(row)
    })
  }

  function formatPublished(published) {
    return published ? 'Published' : 'Not Published'
  }

  $('#CMS_index_content').on('click', '#CMS_sop_articles_table a', e => {
    e.preventDefault()
    $.ajax({
      method: 'GET',
      url: 'cms/sop_articles/' + e.currentTarget.id
    }).done(response => {
      $('#CMS_index_content').empty()
      let content = getCMSSopArticleContent(response.sop_article, response.sop_times, response.sop_categories, response.responsible_offices, response.support_affiliations)
      $('#CMS_index_content').append(content)
      initSample()
      $('#editor').val(response.sop_article.content)
    })
  })

  function getCMSSopArticleContent(article, sop_times, sop_categories, responsible_offices, support_affiliations) {
    return (`
    <div id="${article.id}" class="CMS_sop_article_form_div">
      <form id="CMS_sop_article_form" class="ui form">
        <div class="field">
          <label>CMS Title</label>
          <input type="text" name="article[cms_title]" placeholder="${article.cms_title}" value="${article.cms_title}" required>
        </div>
        ${getSopTimeDropdown("Time", "sop_time_id", sop_times, article.sop_time_id)}
        ${getDropdown("Category", "sop_category_id", sop_categories, article.sop_category_id)}
        <div class="field">
          <label>Title</label>
          <input type="text" name="article[title]" placeholder="Title" value="${article.title}" required>
        </div>
        ${getDropdown("Responsible", "responsible_office_id", responsible_offices, article.responsible_office_id)}
        ${getDropdown("Support", "support_affiliation_id", support_affiliations, article.support_affiliation_id)}
        <div class="field">
          <label>Content</label>
          <textarea name="article[content]" id="editor"></textarea>
        </div>
        <div class="field">
          <label>Video URL</label>
          <input type="text" name="article[video_url]" value="${article.video_url}">
        </div>
        <div class="field">
          <label>Template Links</label>
          <input type="text" name="template_links" value="">
        </div>
        <div class="field">
          <label>Reference Links</label>
          <input type="text" name="reference_links" value="">
        </div>
        <button class="ui button" type="submit">Submit</button>
      </form>
    </div>
    `)
  }

  $('select.dropdown')
    .dropdown({
      action: 'hide'
    });

  function getSopTimeDropdown(label, option_name, sop_times, article_sop_time_id){
    return (`
      <div class="field">
        <label>${label}</label>
        <select name="article[${option_name}]" class="ui dropdown cms_dropdown_select" required>
          <option value="">Select Time Period</option>
          ${_.map(sop_times, time => {
            selected = time.id === article_sop_time_id ? 'selected' : ''
            return `<option ${selected} value="${time.id}">${time.period}</option>`
          }).join('\n')}
        </select>
      </div>
      `)
  }

  $('#CMS_index_content').on('submit', '#CMS_sop_article_form', e => {
    e.preventDefault()
    $.ajax({
      method: 'PATCH',
      url: 'cms/sop_articles/' + e.currentTarget.parentElement.id,
      data: $('#CMS_sop_article_form').serialize() + "?&authenticity_token=" + escape($('meta[name=csrf-token]').attr('content'))
    }).done(response => {
      $('#CMS_sop_articles_link').trigger('click')
      $('.ui.dimmer').dimmer('show')
      _.delay(() => {
        $('.ui.dimmer').dimmer('hide')
      }, 3000, 'later');

    })
  })

  function getDropdown(label, option_name, objects, id){
    return (`
      <div class="field">
        <label>${label}</label>
        <select name="article[${option_name}]" class="ui dropdown cms_dropdown_select" required>
          <option value="">Select Office</option>
          ${_.map(objects, object => {
            selected = object.id === id ? 'selected' : ''
            return `<option ${selected} value="${object.id}">${object.title}</option>`
          }).join('\n')}
        </select>
      </div>
      `)
  }

  if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
    CKEDITOR.tools.enableHtml5Elements( document );

  // The trick to keep the editor in the sample quite small
  // unless user specified own height.
  CKEDITOR.config.height = 150;
  CKEDITOR.config.width = 'auto';

  var initSample = (function() {
    var wysiwygareaAvailable = isWysiwygareaAvailable(),
      isBBCodeBuiltIn = !!CKEDITOR.plugins.get( 'bbcode' );
    return function() {
      var editorElement = CKEDITOR.document.getById( 'editor' );

      // :(((
      // if ( isBBCodeBuiltIn ) {
      //   editorElement.setHtml(
      //     'Hello world!\n\n' +
      //     'I\'m an instance of [url=http://ckeditor.com]CKEditor[/url].'
      //   );
      // }
      // Depending on the wysiwygare plugin availability initialize classic or inline editor.
      if ( wysiwygareaAvailable ) {
        CKEDITOR.replace( 'editor' );
      } else {
        editorElement.setAttribute( 'contenteditable', 'true' );
        CKEDITOR.inline( 'editor' );

        // TODO we can consider displaying some info box that
        // without wysiwygarea the classic editor may not work.
      }
    };

    function isWysiwygareaAvailable() {
      // If in development mode, then the wysiwygarea must be available.
      // Split REV into two strings so builder does not replace it :D.
      if ( CKEDITOR.revision == ( '%RE' + 'V%' ) ) {
        return true;
      }

      return !!CKEDITOR.plugins.get( 'wysiwygarea' );
    }
  })();
})