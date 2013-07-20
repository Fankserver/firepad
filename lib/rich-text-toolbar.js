var firepad = firepad || { };

firepad.RichTextToolbar = (function(global) {
  var utils = firepad.utils;

  function RichTextToolbar() {
    this.element_ = this.makeElement_();
  }

  utils.makeEventEmitter(RichTextToolbar, ['bold', 'italic', 'underline', 'strike', 'font', 'font-size', 'color', 'left', 'center', 'right', 'unordered-list', 'ordered-list', 'todo']);

  RichTextToolbar.prototype.element = function() { return this.element_; };

  RichTextToolbar.prototype.makeElement_ = function() {
    var self = this;
    var bold = utils.elt('a', 'B', { 'class': 'firepad-btn firepad-btn-bold' });
    utils.on(bold, 'click', utils.stopEventAnd(function() { self.trigger('bold'); }));
    var italic = utils.elt('a', 'I', { 'class': 'firepad-btn firepad-btn-italic' });
    utils.on(italic, 'click', utils.stopEventAnd(function() { self.trigger('italic'); }));
    var underline = utils.elt('a', 'U', { 'class': 'firepad-btn firepad-btn-underline' });
    utils.on(underline, 'click', utils.stopEventAnd(function() { self.trigger('underline'); }));
    var strike = utils.elt('a', 'S', { 'class': 'firepad-btn firepad-btn-strike' });
    utils.on(strike, 'click', utils.stopEventAnd(function() { self.trigger('strike'); }));

    var left = utils.elt('a', [ utils.elt('div', [], { 'class': 'firepad-btn-icon'}) ], { 'class': 'firepad-btn firepad-btn-left' });
    utils.on(left, 'click', utils.stopEventAnd(function() { self.trigger('left'); }));
    var center = utils.elt('a', [ utils.elt('div', [], { 'class': 'firepad-btn-icon'}) ], { 'class': 'firepad-btn firepad-btn-center' });
    utils.on(center, 'click', utils.stopEventAnd(function() { self.trigger('center'); }));
    var right = utils.elt('a', [ utils.elt('div', [], { 'class': 'firepad-btn-icon'}) ], { 'class': 'firepad-btn firepad-btn-right' });
    utils.on(right, 'click', utils.stopEventAnd(function() { self.trigger('right'); }));

    var ul = utils.elt('a', [ utils.elt('div', [], { 'class': 'firepad-btn-icon'}) ], { 'class': 'firepad-btn firepad-btn-ul' });
    utils.on(ul, 'click', utils.stopEventAnd(function() { self.trigger('unordered-list'); }));
    var ol = utils.elt('a', [ utils.elt('div', [], { 'class': 'firepad-btn-icon'}) ], { 'class': 'firepad-btn firepad-btn-ol' });
    utils.on(ol, 'click', utils.stopEventAnd(function() { self.trigger('ordered-list'); }));
    var todo = utils.elt('a', [ utils.elt('div', [], { 'class': 'firepad-btn-icon'}) ], { 'class': 'firepad-btn firepad-btn-todo' });
    utils.on(todo, 'click', utils.stopEventAnd(function() { self.trigger('todo'); }));

    var font = this.makeFontDropdown_();
    var fontSize = this.makeFontSizeDropdown_();
    var color = this.makeColorDropdown_();

    var toolbar = utils.elt('div', [
      utils.elt('div', [font], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [fontSize], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [color], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [bold, italic, underline, strike], { 'class': 'firepad-btn-group'}),
      // Add once you have icons
      // utils.elt('div', [left, center, right], { 'class': 'firepad-btn-group'}),

      // Removing 'todo' until we have a slightly better icon (or move to an icon font or something).
      utils.elt('div', [ul, ol/*, todo*/], { 'class': 'firepad-btn-group'})
    ], { 'class': 'firepad-toolbar' });

    return toolbar;
  };

  RichTextToolbar.prototype.makeFontDropdown_ = function() {
    // NOTE: There must be matching .css styles in firepad.css.
    var fonts = ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Times New Roman', 'Verdana'];

    var items = [];
    for(var i = 0; i < fonts.length; i++) {
      var content = utils.elt('span', fonts[i]);
      content.setAttribute('style', 'font-family:' + fonts[i]);
      items.push({ content: content, value: fonts[i] });
    }
    return this.makeDropdown_('Font', 'font', items);
  };

  RichTextToolbar.prototype.makeFontSizeDropdown_ = function() {
    // NOTE: There must be matching .css styles in firepad.css.
    var sizes = [9, 10, 12, 14, 18, 24, 32, 42];

    var items = [];
    for(var i = 0; i < sizes.length; i++) {
      var content = utils.elt('span', sizes[i].toString());
      content.setAttribute('style', 'font-size:' + sizes[i] + 'px; line-height:' + (sizes[i]-6) + 'px;');
      items.push({ content: content, value: sizes[i] });
    }
    return this.makeDropdown_('Size', 'font-size', items, 'px');
  };

  RichTextToolbar.prototype.makeColorDropdown_ = function() {
    var colors = ['black', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'grey'];

    var items = [];
    for(var i = 0; i < colors.length; i++) {
      var content = utils.elt('div');
      content.className = 'firepad-color-dropdown-item';
      content.setAttribute('style', 'background-color:' + colors[i]);
      items.push({ content: content, value: colors[i] });
    }
    return this.makeDropdown_('Color', 'color', items);
  };

  RichTextToolbar.prototype.makeDropdown_ = function(title, eventName, items, value_suffix) {
    value_suffix = value_suffix || "";
    var self = this;
    var button = utils.elt('a', title + ' ▾', { 'class': 'firepad-btn firepad-dropdown' });
    var list = utils.elt('ul', [ ], { 'class': 'firepad-dropdown-menu' });
    button.appendChild(list);

    var isShown = false;
    function showDropdown() {
      if (!isShown) {
        list.style.display = 'block';
        utils.on(document, 'click', hideDropdown, /*capture=*/true);
        isShown = true;
      }
    }

    var justDismissed = false;
    function hideDropdown() {
      if (isShown) {
        list.style.display = '';
        utils.off(document, 'click', hideDropdown, /*capture=*/true);
        isShown = false;
      }
      // HACK so we can avoid re-showing the dropdown if you click on the dropdown header to dismiss it.
      justDismissed = true;
      setTimeout(function() { justDismissed = false; }, 0);
    }

    function addItem(content, value) {
      if (typeof content !== 'object') {
        content = document.createTextNode(String(content));
      }
      var element = utils.elt('a', [content]);

      utils.on(element, 'click', utils.stopEventAnd(function() {
        hideDropdown();
        self.trigger(eventName, value + value_suffix);
      }));

      list.appendChild(element);
    }

    for(var i = 0; i < items.length; i++) {
      var content = items[i].content, value = items[i].value;
      addItem(content, value);
    }

    utils.on(button, 'click', utils.stopEventAnd(function() {
      if (!justDismissed) {
        showDropdown();
      }
    }));

    return button;
  };

  return RichTextToolbar;
})();