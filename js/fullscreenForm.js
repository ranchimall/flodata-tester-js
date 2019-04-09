/**
 * fullscreenForm.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;
(function(window) {

        'use strict';

        var support = { animations: Modernizr.cssanimations },
            animEndEventNames = { 'WebkitAnimation': 'webkitAnimationEnd', 'OAnimation': 'oAnimationEnd', 'msAnimation': 'MSAnimationEnd', 'animation': 'animationend' },
            // animation end event name
            animEndEventName = animEndEventNames[Modernizr.prefixed('animation')];

        /**
         * extend obj function
         */
        function extend(a, b) {
            for (var key in b) {
                if (b.hasOwnProperty(key)) {
                    a[key] = b[key];
                }
            }
            return a;
        }

        /**
         * createElement function
         * creates an element with tag = tag, className = opt.cName, innerHTML = opt.inner and appends it to opt.appendTo
         */
        function createElement(tag, opt) {
            var el = document.createElement(tag)
            if (opt) {
                if (opt.cName) {
                    el.className = opt.cName;
                }
                if (opt.inner) {
                    el.innerHTML = opt.inner;
                }
                if (opt.appendTo) {
                    opt.appendTo.appendChild(el);
                }
            }
            return el;
        }

        // finds no of occurances of substring
        function occurrences(string, subString, allowOverlapping) {
            string += "";
            subString += "";
            if (subString.length <= 0) return (string.length + 1);

            var n = 0,
                pos = 0,
                step = allowOverlapping ? 1 : subString.length;

            while (true) {
                pos = string.indexOf(subString, pos);
                if (pos >= 0) {
                    ++n;
                    pos += step;
                } else break;
            }
            return n;
        }

        function isTransfer(text) {
            var wordlist = ['transfer', 'send', 'give']; // keep list's content lowercase
            var textList = text.split(' ');
            for (var i = 0; i < wordlist.length; i++) {
                if (textList.includes(wordlist[i])) {
                    return true;
                }
            }
            return false;
        }


        function isIncorp(text) {
            var wordlist = ['incorporate', 'create', 'start', 'begin']; // keep list's content lowercase
            var textList = text.split(' ');
            for (var i = 0; i < wordlist.length; i++) {
                if (textList.includes(wordlist[i])) {
                    return true;
                }
            }
            return false;
        }


        function extractAmount(text) {
            var count = 0;
            var returnval;
            var splitText = text.split(/\W+/);

            for (var i = 0; i < splitText.length; i++) {
                if (parseFloat(splitText[i])) {
                    count += 1;
                    returnval = parseFloat(splitText[i]);
                }
                if (count > 1) {
                    return 0;
                }
            }
            return returnval;
        }

        function extractAddress(text) {
            textList = text.split(' ')
            for (var i = 0; i < textList.length; i++) {
                if (textList[i] == '') {
                    continue;
                }
                if (textList[i].endsWith('$') && textList[i].length != 1) {
                    return textList[i];
                }
            }
            return 0;
        }


        function extractInitTokens(text) {
            var base_units = { 'thousand': 10 ** 3, 'million': 10 ** 6, 'billion': 10 ** 9, 'trillion': 10 ** 12 };
            var textList = text.split(' ');
            var counter = 0;
            var value;
            for (var i = 0; i < textList.length; i++) {
                if (!isNaN(textList[i])) {
                    if (base_units.hasOwnProperty(textList[i + 1])) {
                        value = textList[i] * base_units[textList[i + 1]];
                        counter += 1;
                    }
                } else {
                    for (var j = 0; j < Object.keys(base_units).length; j++) {
                        var result = textList[i].split(Object.keys(base_units)[j]);
                        if (result.length == 2 && result[1] == '' && result[0] != '') {
                            if (!isNaN(result[0])) {
                                value = parseFloat(result[0]) * base_units[Object.keys(base_units)[j]];
                                counter = counter + 1;
                            }
                        }
                    }
                }
            }

            if (counter == 1) {
                return value;
            } else {
                return 0;
            }
        }



        function parse_flodata(flodata) {
            if (flodata.slice(0, 5) == 'text') {
                flodata = flodata.split('text:')[1];
            }

            var nospacestring = flodata.replace(/ +/g, ' ');
            var cleanstring = nospacestring.toLowerCase();

            var parsed_data;

            var atList = [];
            var hashList = [];

            cleanstringList = cleanstring.split(' ')

            for (var i = 0; i < cleanstringList.length; i++) {
                if (cleanstringList[i].endsWith('@') && cleanstringList[i].length != 1) {
                    atList.push(cleanstringList[i]);
                }
                if (cleanstringList[i].endsWith('#') && cleanstringList[i].length != 1) {
                    hashList.push(cleanstringList[i]);
                }
            }

            if (atList.length == 0 && hashList.length == 0 || atList.length > 1 || hashList.length > 1) {
                parsed_data = { 'type': 'noise' };
            } else if (hashList.length == 1 && atList.length == 0) {
                // Passing the above check means token creation or transfer
                incorporation = isIncorp(cleanstring);
                transfer = isTransfer(cleanstring);

                //todo Rule 27 - if (neither token incorporation and token transfer) OR both token incorporation and token transfer, reject
                if ((!incorporation && !transfer) || (incorporation && transfer)) {
                    parsed_data = { 'type': 'noise' };
                } else if (incorporation && !transfer) {
                    initTokens = extractInitTokens(cleanstring);
                    if (initTokens != 0) {
                        parsed_data = {
                            'type': 'tokenIncorporation',
                            'flodata': string,
                            'tokenIdentification': hashList[0].slice(0, hashList[0].length - 1),
                            'tokenAmount': initTokens
                        };
                    } else {
                        parsed_data = { 'type': 'noise' };
                    }
                }
                // todo Rule 30 - if not token creation and is token transfer then then process it for token transfer rules
                // todo Rule 31 - Extract number of tokens to be sent and the address to which to be sent, both data is mandatory
                else if (!incorporation && transfer) {
                    amount = extractAmount(cleanstring, hashList[0].slice(0, hashList[0].length - 1); address = extractAddress(nospacestring);
                        if (amount != 0 && address != 0) {
                            parsed_data = {
                                'type': 'transfer',
                                'transferType': 'token',
                                'flodata': string,
                                'tokenIdentification': hashList[0].slice(0, hashList[0].length - 1),
                                'tokenAmount': amount,
                                'address': address.slice(0, address.length - 1
                                };
                            }
                            else {
                                parsed_data = { 'type': 'noise' };
                            }
                        }

                    }
                    else {
                        parsed_data = { 'type': 'noise' };
                    }

                    return parsed_data;
                }


                /**
                 * FForm function
                 */
                function FForm(el, options) {
                    this.el = el;
                    this.options = extend({}, this.options);
                    extend(this.options, options);
                    this._init();
                }

                /**
                 * FForm options
                 */
                FForm.prototype.options = {
                    // show progress bar
                    ctrlProgress: true,
                    // show navigation dots
                    ctrlNavDots: true,
                    // show [current field]/[total fields] status
                    ctrlNavPosition: true,
                    // reached the review and submit step
                    onReview: function() { return false; }
                };

                /**
                 * init function
                 * initialize and cache some vars
                 */
                FForm.prototype._init = function() {
                    // the form element
                    this.formEl = this.el.querySelector('form');

                    // list of fields
                    this.fieldsList = this.formEl.querySelector('ol.fs-fields');

                    // current field position
                    this.current = 0;

                    // all fields
                    this.fields = [].slice.call(this.fieldsList.children);

                    // total fields
                    this.fieldsCount = this.fields.length;

                    // show first field
                    classie.add(this.fields[this.current], 'fs-current');

                    // create/add controls
                    this._addControls();

                    // create/add messages
                    this._addErrorMsg();

                    // init events
                    this._initEvents();
                };

                /**
                 * addControls function
                 * create and insert the structure for the controls
                 */
                FForm.prototype._addControls = function() {
                    // main controls wrapper
                    this.ctrls = createElement('div', { cName: 'fs-controls', appendTo: this.el });

                    // continue button (jump to next field)
                    this.ctrlContinue = createElement('button', { cName: 'fs-continue', inner: 'Continue', appendTo: this.ctrls });
                    this._showCtrl(this.ctrlContinue);

                    // navigation dots
                    if (this.options.ctrlNavDots) {
                        this.ctrlNav = createElement('nav', { cName: 'fs-nav-dots', appendTo: this.ctrls });
                        var dots = '';
                        for (var i = 0; i < this.fieldsCount; ++i) {
                            dots += i === this.current ? '<button class="fs-dot-current"></button>' : '<button disabled></button>';
                        }
                        this.ctrlNav.innerHTML = dots;
                        this._showCtrl(this.ctrlNav);
                        this.ctrlNavDots = [].slice.call(this.ctrlNav.children);
                    }

                    // field number status
                    if (this.options.ctrlNavPosition) {
                        this.ctrlFldStatus = createElement('span', { cName: 'fs-numbers', appendTo: this.ctrls });

                        // current field placeholder
                        this.ctrlFldStatusCurr = createElement('span', { cName: 'fs-number-current', inner: Number(this.current + 1) });
                        this.ctrlFldStatus.appendChild(this.ctrlFldStatusCurr);

                        // total fields placeholder
                        this.ctrlFldStatusTotal = createElement('span', { cName: 'fs-number-total', inner: this.fieldsCount });
                        this.ctrlFldStatus.appendChild(this.ctrlFldStatusTotal);
                        this._showCtrl(this.ctrlFldStatus);
                    }

                    // progress bar
                    if (this.options.ctrlProgress) {
                        this.ctrlProgress = createElement('div', { cName: 'fs-progress', appendTo: this.ctrls });
                        this._showCtrl(this.ctrlProgress);
                    }
                }

                /**
                 * addErrorMsg function
                 * create and insert the structure for the error message
                 */
                FForm.prototype._addErrorMsg = function() {
                    // error message
                    this.msgError = createElement('span', { cName: 'fs-message-error', appendTo: this.el });
                }

                /**
                 * init events
                 */
                FForm.prototype._initEvents = function() {
                    var self = this;

                    // show next field
                    this.ctrlContinue.addEventListener('click', function() {
                        var flodata = document.getElementById('q1');
                        var result = parse_flodata(flodata.value);
                        console.log(result);
                        self._nextField(undefined, result);
                    });

                    // navigation dots
                    if (this.options.ctrlNavDots) {
                        this.ctrlNavDots.forEach(function(dot, pos) {
                            dot.addEventListener('click', function() {
                                self._showField(pos);
                            });
                        });
                    }

                    // jump to next field without clicking the continue button (for fields/list items with the attribute "data-input-trigger")
                    this.fields.forEach(function(fld) {
                        if (fld.hasAttribute('data-input-trigger')) {
                            var input = fld.querySelector('input[type="radio"]') || /*fld.querySelector( '.cs-select' ) ||*/ fld.querySelector('select'); // assuming only radio and select elements (TODO: exclude multiple selects)
                            if (!input) return;

                            switch (input.tagName.toLowerCase()) {
                                case 'select':
                                    input.addEventListener('change', function() { self._nextField(); });
                                    break;

                                case 'input':
                                    [].slice.call(fld.querySelectorAll('input[type="radio"]')).forEach(function(inp) {
                                        inp.addEventListener('change', function(ev) { self._nextField(); });
                                    });
                                    break;

                                    /*
                                    // for our custom select we would do something like:
                                    case 'div' :
                                    	[].slice.call( fld.querySelectorAll( 'ul > li' ) ).forEach( function( inp ) {
                                    		inp.addEventListener( 'click', function(ev) { self._nextField(); } );
                                    	} );
                                    	break;
                                    */
                            }
                        }
                    });

                    // keyboard navigation events - jump to next field when pressing enter
                    document.addEventListener('keydown', function(ev) {
                        if (!self.isLastStep && ev.target.tagName.toLowerCase() !== 'textarea') {
                            var keyCode = ev.keyCode || ev.which;
                            if (keyCode === 13) {
                                ev.preventDefault();
                                var flodata = document.getElementById('q1');
                                var result = parse_flodata(flodata.value);
                                console.log(result);
                                self._nextField(undefined, result);
                            }
                        }
                    });
                };

                /**
                 * nextField function
                 * jumps to the next field
                 */
                FForm.prototype._nextField = function(backto, result) {
                    if (this.isLastStep || !this._validade() || this.isAnimating) {
                        return false;
                    }
                    this.isAnimating = true;

                    // check if on last step
                    this.isLastStep = this.current === this.fieldsCount - 1 && backto === undefined ? true : false;

                    // clear any previous error messages
                    this._clearError();

                    // current field
                    var currentFld = this.fields[this.current];

                    // save the navigation direction
                    this.navdir = backto !== undefined ? backto < this.current ? 'prev' : 'next' : 'next';

                    // update current field
                    this.current = backto !== undefined ? backto : this.current + 1;

                    if (backto === undefined) {
                        // update progress bar (unless we navigate backwards)
                        this._progress();

                        // save farthest position so far
                        this.farthest = this.current;
                    }

                    // add class "fs-display-next" or "fs-display-prev" to the list of fields
                    classie.add(this.fieldsList, 'fs-display-' + this.navdir);

                    // remove class "fs-current" from current field and add it to the next one
                    // also add class "fs-show" to the next field and the class "fs-hide" to the current one
                    classie.remove(currentFld, 'fs-current');
                    classie.add(currentFld, 'fs-hide');

                    if (!this.isLastStep) {
                        // update nav
                        this._updateNav();

                        // change the current field number/status
                        this._updateFieldNumber();

                        var nextField = this.fields[this.current];
                        classie.add(nextField, 'fs-current');
                        classie.add(nextField, 'fs-show');
                    }

                    // after animation ends remove added classes from fields
                    var self = this,
                        onEndAnimationFn = function(ev) {
                            if (support.animations) {
                                this.removeEventListener(animEndEventName, onEndAnimationFn);
                            }

                            classie.remove(self.fieldsList, 'fs-display-' + self.navdir);
                            classie.remove(currentFld, 'fs-hide');

                            if (self.isLastStep) {
                                // show the complete form and hide the controls
                                self._hideCtrl(self.ctrlNav);
                                self._hideCtrl(self.ctrlProgress);
                                self._hideCtrl(self.ctrlContinue);
                                self._hideCtrl(self.ctrlFldStatus);
                                // replace class fs-form-full with fs-form-overview
                                classie.remove(self.formEl, 'fs-form-full');
                                classie.add(self.formEl, 'fs-form-overview');
                                classie.add(self.formEl, 'fs-show');
                                classie.add(self.formEl, 'hideElement');

                                // Result display page
                                var div = document.createElement("div");
                                div.setAttribute("id", "resultPage");
                                div.setAttribute("class", "fs-form fs-form-overview fs-show");

                                var ol = document.createElement('ol');
                                ol.setAttribute("class", "fs-fields");

                                if (result['type'] == 'transfer') {
                                    var fieldnames = [{ 'FLO data': result['flodata'] }, { 'Type': 'Transfer' }, { 'Identification': result['marker'] }, { 'Amount': result['amount'] }]
                                } else if (result['type'] == 'incorporation') {
                                    var fieldnames = [{ 'FLO data': result['flodata'] }, { 'Type': 'Incorporation' }, { 'Identification': result['marker'] }, { 'Amount': result['initTokens'] }]
                                } else {
                                    var fieldnames = [{ 'FLO data': result['flodata'] }, { 'Type': 'Noise' }]
                                }

                                for (var i = 0; i < fieldnames.length; i++) {
                                    var item = document.createElement('li');
                                    var label = document.createElement('label');
                                    label.setAttribute('class', 'fs-field-label fs-anim-upper');
                                    label.setAttribute('for', 'q' + i.toString());
                                    label.innerHTML = Object.keys(fieldnames[i])[0]
                                    var input = document.createElement('input');
                                    input.setAttribute('class', 'fs-anim-lower');
                                    input.setAttribute("id", 'q' + i.toString());
                                    input.setAttribute("name", 'q' + i.toString());
                                    input.setAttribute("type", "text");
                                    input.setAttribute("value", fieldnames[i][label.innerHTML]);
                                    item.appendChild(label);
                                    item.appendChild(input);
                                    ol.appendChild(item);
                                }

                                var returnButton = document.createElement('button');
                                returnButton.setAttribute('class', 'fs-submit');
                                returnButton.setAttribute('type', 'submit');
                                returnButton.innerHTML = 'Go Back';
                                returnButton.onclick = function() {
                                    location.href = "index.html";
                                };

                                div.appendChild(ol);
                                div.appendChild(returnButton);
                                var formElement = document.getElementById('myform');
                                formElement.insertAdjacentElement('afterend', div);

                                // callback
                                self.options.onReview();
                            } else {
                                classie.remove(nextField, 'fs-show');

                                if (self.options.ctrlNavPosition) {
                                    self.ctrlFldStatusCurr.innerHTML = self.ctrlFldStatusNew.innerHTML;
                                    self.ctrlFldStatus.removeChild(self.ctrlFldStatusNew);
                                    classie.remove(self.ctrlFldStatus, 'fs-show-' + self.navdir);
                                }
                            }
                            self.isAnimating = false;
                        };

                    if (support.animations) {
                        if (this.navdir === 'next') {
                            if (this.isLastStep) {
                                currentFld.querySelector('.fs-anim-upper').addEventListener(animEndEventName, onEndAnimationFn);
                            } else {
                                nextField.querySelector('.fs-anim-lower').addEventListener(animEndEventName, onEndAnimationFn);
                            }
                        } else {
                            nextField.querySelector('.fs-anim-upper').addEventListener(animEndEventName, onEndAnimationFn);
                        }
                    } else {
                        onEndAnimationFn();
                    }
                }

                /**
                 * showField function
                 * jumps to the field at position pos
                 */
                FForm.prototype._showField = function(pos) {
                    if (pos === this.current || pos < 0 || pos > this.fieldsCount - 1) {
                        return false;
                    }
                    this._nextField(pos);
                }

                /**
                 * updateFieldNumber function
                 * changes the current field number
                 */
                FForm.prototype._updateFieldNumber = function() {
                    if (this.options.ctrlNavPosition) {
                        // first, create next field number placeholder
                        this.ctrlFldStatusNew = document.createElement('span');
                        this.ctrlFldStatusNew.className = 'fs-number-new';
                        this.ctrlFldStatusNew.innerHTML = Number(this.current + 1);

                        // insert it in the DOM
                        this.ctrlFldStatus.appendChild(this.ctrlFldStatusNew);

                        // add class "fs-show-next" or "fs-show-prev" depending on the navigation direction
                        var self = this;
                        setTimeout(function() {
                            classie.add(self.ctrlFldStatus, self.navdir === 'next' ? 'fs-show-next' : 'fs-show-prev');
                        }, 25);
                    }
                }

                /**
                 * progress function
                 * updates the progress bar by setting its width
                 */
                FForm.prototype._progress = function() {
                    if (this.options.ctrlProgress) {
                        this.ctrlProgress.style.width = this.current * (100 / this.fieldsCount) + '%';
                    }
                }

                /**
                 * updateNav function
                 * updates the navigation dots
                 */
                FForm.prototype._updateNav = function() {
                    if (this.options.ctrlNavDots) {
                        classie.remove(this.ctrlNav.querySelector('button.fs-dot-current'), 'fs-dot-current');
                        classie.add(this.ctrlNavDots[this.current], 'fs-dot-current');
                        this.ctrlNavDots[this.current].disabled = false;
                    }
                }

                /**
                 * showCtrl function
                 * shows a control
                 */
                FForm.prototype._showCtrl = function(ctrl) {
                    classie.add(ctrl, 'fs-show');
                }

                /**
                 * hideCtrl function
                 * hides a control
                 */
                FForm.prototype._hideCtrl = function(ctrl) {
                    classie.remove(ctrl, 'fs-show');
                }

                // TODO: this is a very basic validation function. Only checks for required fields..
                FForm.prototype._validade = function() {
                    var fld = this.fields[this.current],
                        input = fld.querySelector('input[required]') || fld.querySelector('textarea[required]') || fld.querySelector('select[required]'),
                        error;

                    if (!input) return true;

                    switch (input.tagName.toLowerCase()) {
                        case 'input':
                            if (input.type === 'radio' || input.type === 'checkbox') {
                                var checked = 0;
                                [].slice.call(fld.querySelectorAll('input[type="' + input.type + '"]')).forEach(function(inp) {
                                    if (inp.checked) {
                                        ++checked;
                                    }
                                });
                                if (!checked) {
                                    error = 'NOVAL';
                                }
                            } else if (input.value === '') {
                                error = 'NOVAL';
                            }
                            break;

                        case 'select':
                            // assuming here '' or '-1' only
                            if (input.value === '' || input.value === '-1') {
                                error = 'NOVAL';
                            }
                            break;

                        case 'textarea':
                            if (input.value === '') {
                                error = 'NOVAL';
                            }
                            break;
                    }

                    if (error != undefined) {
                        this._showError(error);
                        return false;
                    }

                    return true;
                }

                // TODO
                FForm.prototype._showError = function(err) {
                    var message = '';
                    switch (err) {
                        case 'NOVAL':
                            message = 'Please fill the field before continuing';
                            break;
                        case 'INVALIDEMAIL':
                            message = 'Please fill a valid email address';
                            break;
                            // ...
                    };
                    this.msgError.innerHTML = message;
                    this._showCtrl(this.msgError);
                }

                // clears/hides the current error message
                FForm.prototype._clearError = function() {
                    this._hideCtrl(this.msgError);
                }

                // add to global namespace
                window.FForm = FForm;


            })(window);