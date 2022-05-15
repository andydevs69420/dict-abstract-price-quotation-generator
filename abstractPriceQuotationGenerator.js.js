/*
    Abstract Price Quotation Generator
    | by andydevs69420
    | github: https://github.com/andydevs69420/dict-abstractPriceQuotationGenerator.git
    | Abstract price quotation generator is a simple tool that generates price quotations for DICT.
    | May 14 2022
    ;
*/

(function APQG() {

    // supported paper sizes
    window.PAPER_SIZE = Object.freeze({
        A4    : {_w: 210, _h: 297},
        LEGAL : {_w: 216, _h: 356},
    });

    // supported paper orientation
    window.PAPER_ORIENTATION = Object.freeze({
        PORTRAIT  : "p",
        LANDSCAPE : "l",
    });

    /**
     * Enusure size parameter is supported
     * @param {string} size
     * @returns {boolean}
     **/
    function verifySize(size)
    {
        if (size.constructor.name !== "Object")
        throw new TypeError("size must be an Object type!, got "+size.constructor.name);
        
        if ((size._w === null || size._w === undefined) && (size._h === null || size._h === undefined))
        throw new TypeError("invalid size " + size);

        if ((size._w.constructor.name !== "Number") && (size._h.constructor.name !== "Number"))
        throw new TypeError("invalid size " + size);

        return size;
    }

    /**
     * Creates new element (dom)
     * @param {String} element element tag
     **/ 
    function $el(element, option) {
        let el = document.createElement(element);

        if (!option)
        return el;
        
        if (option.constructor.name !== "Object") 
        throw new TypeError("option must be an Object type!, got "+option.constructor.name);

        let valid_keys = ["style", "attrib"];
        let keys       = Object.keys(option);

        keys.forEach((k) => {
            switch (k) {
                case "style":
                    setStyle(el, option[k]);
                    break;
                case "attrib":
                    setAttrib(el, option[k]);
                    break;
                default:
                    throw new InvalidPropertyError("invalid property: "+k);
            }

        });

        return el;
    }

    /**
     * Set's the style of an element
     * @param {HTMLElement} element the element
     * @return HTMLElement element
     **/
    function setStyle(element, properties) {

        if (!(element instanceof HTMLElement))
        throw new TypeError("element must be an Object type!, got "+element.constructor.name);

        if (properties.constructor.name !== "Object")
        throw new TypeError("properties must be an Object type!, got "+properties.constructor.name);

        let keys = Object.keys(properties);
        keys.forEach((k) => {
            propname  = camelCase(k);
            propvalue = properties[k];
            element.style[propname] = propvalue;
        });
        return element;
    }

    /**
     * Set's the attributes of an element
     * @param {HTMLElement} element the element
     * @return HTMLElement element
     **/
    function setAttrib(element, properties) {
        if (!(element instanceof HTMLElement))
        throw new TypeError("element must be an Object type!, got "+element.constructor.name);

        if (properties.constructor.name !== "Object")
        throw new TypeError("properties must be an Object type!, got "+properties.constructor.name);

        let keys = Object.keys(properties);
        keys.forEach((k) => {
            attrib = properties[k];
            element.setAttribute(k, attrib);
        });
        return element;
    }

    /**
     * Convets dashed string to cammel case
     * @param {String} prop propname
     * @return String
     * @example
     *      let x = "min-width";
     *      x = camelCase(x);
     *      console.log(x);
     *      // minWidth 
     **/
    function camelCase(prop) {
        let splits   = prop.toString().split("-");
        let propname = ""; 

        for (let i = 0; i < splits.length; i++) {
            if (i === 0) {
                propname += splits[i].toLowerCase();
            }
            else {
                propname += splits[i].charAt(0).toUpperCase() + splits[i].slice(1);
            }
        }
        return propname;
    }

    instance_no = -1;

    window.AbstractPriceQuotationGenerator = class {

        constructor(option={size:PAPER_SIZE.A4, orientation:PAPER_ORIENTATION.LANDSCAPE}) {

            if (option.constructor.name !== "Object")
            throw new TypeError("option must be an Object type!, got "+option.constructor.name);

            instance_no++;

            this.LOOKUP_TAG      = "dict-apqg";
            this.NUMBER_OF_UNITS = 9;
            this.PURPOSE_SLOT_ID = "purpose-slot-value";

            this.PARENT      = document.getElementsByTagName(this.LOOKUP_TAG)[instance_no];
            setStyle(this.PARENT, {
                "display"     : "flex",
                "align-items" : "center",
                "justify-content": "center",
            });
            this.SIZE        = verifySize(option.size);
            this.ORIENTATION = option.orientation;

            this.PURPOSE     = null;
            this.SUPPLIERS   = null;
            this.HEADERLST   = null;
            this.PAGE_HEAD   = [];
            this.COLSPANS    = [];
            this.ITEM_LIST   = [];
            this.ITEM_ROWS   = [];

        }

        /**
         * Setup the base paper/document
         * @return HTMLElement
         **/ 
        make__Paper() {
            let paper = $el("section");
                paper = setStyle(paper, {
                    "display" : "flex",
                    "align-items" : "center",
                    "justify-content" : "center",
                    "margin" : "auto" ,
                    "width"  : this.SIZE._w + "mm",
                    "height" : this.SIZE._h + "mm",
                    "background-color" : "#FFFFFF",
                    "font-family" : "Calibri, sans-serif",
                });
            
            if (this.ORIENTATION === PAPER_ORIENTATION.LANDSCAPE) {
                paper = setStyle(paper, {
                    "width"  : this.SIZE._h + "mm",
                    "height" : this.SIZE._w + "mm",
                });
            }

            return paper;
        }

        /**
         * Setup the table
         * @return HTMLElement
         * @example
         **/
        make__Table(header, hasPurpose=true) {

            if (!header.constructor.name === "Array")
            throw new TypeError("header must be an Array type!, got "+header.constructor.name);

            if (!hasPurpose.constructor.name === "Boolean")
            throw new TypeError("hasPurpose must be an Boolean type!, got "+hasPurpose.constructor.name);

            let table = $el("table", {
                style : {
                    "width"  : "90%",
                    "margin" : "auto",
                    "border" : "1px solid black",
                    "border-collapse" : "collapse",
                    "table-layout" : "fixed",
                }
            });

                // header
                let thead_0 = $el("thead");

                    let tr_purpose_group = $el("tr", {
                        style : {
                            "border-bottom" : "1px solid black"
                        }
                    });
                    
                        let th_purpose_label = $el("th", {
                            style : {
                                "height" : "auto" ,
                                "padding" : ".5em",
                                "vertical-align" : "top"
                            },
                            attrib : {
                                "colspan" : this.NUMBER_OF_UNITS - (this.NUMBER_OF_UNITS - 1)
                            }
                        });

                        th_purpose_label.innerText = "Purpose:";


                        let td_purpose_slot = $el("td", {
                            style  : {
                                "height" : "auto" ,
                                "padding" : ".5em",
                                "vertical-align" : "middle"
                            },
                            attrib : {
                                "colspan" : (this.NUMBER_OF_UNITS - 1)
                            }
                        });

                        td_purpose_slot.innerText = this.truncate__Text(this.PURPOSE, 255);

                    tr_purpose_group.appendChild(th_purpose_label);
                    tr_purpose_group.appendChild(td_purpose_slot);
                
                if (hasPurpose)
                    thead_0.appendChild(tr_purpose_group);
                
                let thead_1 = $el("thead");

                    let tr_header_group = $el("tr", {
                        style : {
                            "border-bottom" : "1px solid black",
                        }
                    });

                    // sort header
                    header.sort((a, b) => {
                        let h_0 = this.HEADERLST.map((arr) => arr[0]);
                        let h_1 = this.HEADERLST.map((arr) => arr[1]);
                        if (h_0[h_1.indexOf(a)] > h_0[h_1.indexOf(b)]) return 1;
                        if (h_0[h_1.indexOf(a)] < h_0[h_1.indexOf(b)]) return -1;
                        return 0;
                  
                    });

                    let max_idx = 0;

                    for (let iter_i = 0; iter_i < header.length; iter_i++)
                        for (let iter_j = 0; iter_j < header.length; iter_j++)
                            if (header[iter_j].length > header[max_idx].length)
                                max_idx = iter_j;

                    let iter_idx = 0;
                    let colspan = [];
                    header.forEach((th_val) => {

                        colspan.push((iter_idx !== max_idx)? (() => {
                            let colspan = this.NUMBER_OF_UNITS - (this.NUMBER_OF_UNITS) - (header.length - 1);

                            if (colspan <= 0)
                                return "1";

                            return colspan;
                        })()
                        : 
                        (() => {
                            let colspan = (this.NUMBER_OF_UNITS) - (header.length - 1);

                            if (colspan <= 0)
                                return "1";

                            return colspan;
                        })());


                        let th_as_column = $el("th", {
                            style  : {
                                "padding"       : ".8em .2em",
                                "text-align"    : "center",
                                "border-left"   : (iter_idx !== 0) ? "1px solid black" : "none",
                                "overflow-wrap" : "break-word",
                            },
                            attrib : {
                                "colspan" : colspan[colspan.length - 1]
                            }
                        });

                        th_as_column.innerText = this.truncate__Text(th_val, 40);

                        tr_header_group.appendChild(th_as_column);

                        iter_idx++;
                    });

                    this.COLSPANS.push(colspan);
                
                thead_1.appendChild(tr_header_group);
            
        
            table.appendChild(thead_0);
            table.appendChild(thead_1);
                
            return table;
        }

        append__Rows(table, page_num_in_index) {

            if (!table instanceof HTMLElement)
            throw new TypeError("table must be an HTMLElement type!, got "+table.constructor.name);

            if (page_num_in_index.constructor.name !== "Number")
            throw new TypeError("page_num_in_index must be an Number type!, got "+page_num_in_index.constructor.name);

            this.ITEM_ROWS[page_num_in_index].forEach((row) => {
                let tr_row = $el("tr", {
                    style : {
                        "border-bottom" : "1px solid black",
                    }
                });
                
                let iter_idx = 0;
                row.forEach((td_val) => {
                    let td_as_column = $el("td", {
                        style  : {
                            "padding"       : ".2em",
                            "text-align"    : "center",
                            "font-weight"   : "bold",
                            "border-left"   : (iter_idx !== 0) ? "1px solid black" : "none",
                            "overflow-wrap" : "break-word",
                            "font-size" : "14px",
                        },
                        attrib : {
                            "colspan" : this.COLSPANS[page_num_in_index][iter_idx]
                        }
                    });

                    td_as_column.innerText = this.truncate__Text(td_val.toString(), 40);

                    tr_row.appendChild(td_as_column);
                    iter_idx++;
                });
                
                table.appendChild(tr_row);
            });

        }

        truncate__Text(text, limit=50) {

            if (text.constructor.name !== "String")
            throw new TypeError("text must be a String type!, got "+text.constructor.name);

            if (limit.constructor.name !== "Number")
            throw new TypeError("limit must be a Number type!, got "+limit.constructor.name);

            if (text.length > (limit - 3))
                return text.substring(0, (limit - 3)) + "...";
            return text;
        }

        // #=================================== SETTERS =================================


        setPurpose(string) {

            if (string.constructor.name !== "String")
            throw new TypeError("string must be an String type!, got "+string.constructor.name);

            this.PURPOSE = string;

        }

        markAsSupplier(suppliers) {

            if (!this.PURPOSE)
            throw new Error("Purpose must be set before marking as supplier!");

            if (suppliers.constructor.name !== "Array")
            throw new TypeError("suppliers must be an Array type!, got "+suppliers.constructor.name);

            this.SUPPLIERS = suppliers;

        }

        setColumnHeader(header) {

            if (!this.SUPPLIERS)
            throw new Error("Suppliers must be set before setting column header!");

            if (header.constructor.name !== "Array")
            throw new TypeError("header must be an Array type!, got "+header.constructor.name);

            this.SUPPLIERS?.forEach((supplier) => {
                if (!header.map((e) => e[1]).includes(supplier))
                throw new Error("supplier "+supplier+" is not found in the given column header!");
            });

            this.HEADERLST = header;

            while (this.COL_HEADER?.firstChild)
            this.COL_HEADER?.removeChild(this.COL_HEADER.firstChild);

            let supplier_copy = this.SUPPLIERS.map((supp) => supp);

            let required_head = header.map((h) => h[1]).filter((e) => !supplier_copy.includes(e));

            while (supplier_copy.length > 0) {
                let filtered_header = required_head.map((item) => item);
                filtered_header = filtered_header.concat(supplier_copy.splice(0, 3));
                this.PAGE_HEAD.push(filtered_header);
            }

        }

        addRow(row) {

            if (row.constructor.name !== "Array")
            throw new TypeError("row must be an Array type!, got "+row.constructor.name);
            
            if (row.length !== this.HEADERLST.length)
            throw new Error("invalid row column count! expected "+this.HEADERLST.length+", got "+row.length);

            this.ITEM_LIST.push(row);
            this.ITEM_ROWS = [];

            this.PAGE_HEAD.forEach((header) => {

                let page_supplier_indexes = this.SUPPLIERS.filter((e) => {
                    return header.includes(e);
                }).map((s) => this.HEADERLST.map((h) => h[1]).indexOf(s));

                console.log(page_supplier_indexes);

                let supplier_copy = this.SUPPLIERS.map((supp) => supp);
                let required_head_indexes = this.HEADERLST.map((h) => h[1]).filter((e) => !supplier_copy.includes(e)).map((rh) => this.HEADERLST.map((hl) => hl[1]).indexOf(rh));

                let row_indexes = (required_head_indexes.concat(page_supplier_indexes)).sort((a, b) => a < b ? -1 : 1);
                
                let current_page = [];
                
                this.ITEM_LIST.forEach((item_row) => {

                    let current_row = [];

                    row_indexes.forEach((idx) => {
                        current_row.push(item_row[idx]);
                    });

                    current_page.push(current_row);

                });

                this.ITEM_ROWS.push(current_page);
                
            });

        }

        generatexxxx() {

            if (!this.HEADERLST)
            throw new Error("Column header must be set before generating!");

            let PAPER__WRAPPER = $el("div", {
                    style : {
                        "width" : "fit-content",
                    }
            })

            this.PARENT?.appendChild(PAPER__WRAPPER);

            if (this.PAGE_HEAD.length === 1) {

                let paper = this.make__Paper();
                    let wrapper = $el("div");
                        let table = this.make__Table(this.PAGE_HEAD[0], true);
                    wrapper.appendChild(table);
                paper.appendChild(wrapper);
                PAPER__WRAPPER?.appendChild(paper);

            } else {

                let idx = 0;
                let hasPurpose = true;

                this.PAGE_HEAD.forEach((h) => {

                    let paper = this.make__Paper();
                        let wrapper = $el("div");
                            let table = this.make__Table(h, hasPurpose);
                            this.append__Rows(table, idx);
                        wrapper.appendChild(table);
                    idx++;
                    hasPurpose = false;
                    paper.appendChild(wrapper);
                    PAPER__WRAPPER?.appendChild(paper);
                    
                });

            }

            let size = [
                (this.SIZE._w * 3.779527559),
                (this.SIZE._h * 3.779527559),
            ];

            let docx = new jspdf.jsPDF({
                orientation : this.ORIENTATION,
                format      : (this.ORIENTATION === "l")? size.reverse() : size,
                unit        : "px",
            });

            docx.html(PAPER__WRAPPER, {
                x: 0,
                y: 0,
                callback: function (doc) {
                    doc.output("dataurlnewwindow");
                    // doc.save("test.pdf");
                }
            });
        }

        getPaper() {
            return this.PAPER;
        }

    }


    /**
     * TypeError class for better error classification
     * @param {string} message
     **/
    window.TypeError = class extends Error {
        constructor(message) {
            super(message); 
            this.name = "TypeError";
        }
    }

    /**
     * TypeError class for better error classification
     * @param {string} message
     **/
     window.InvalidPropertyError = class extends Error {
        constructor(message) {
            super(message); 
            this.name = "InvalidPropertyError";
        }
    }

})();
