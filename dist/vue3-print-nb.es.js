class Print$1 {
  constructor(option) {
    this.standards = {
      strict: "strict",
      loose: "loose",
      html5: "html5"
    };
    this.previewBody = null;
    this.close = null;
    this.previewBodyUtilPrintBtn = null;
    this.selectArray = [];
    this.counter = 0;
    this.settings = {
      standard: this.standards.html5
    };
    Object.assign(this.settings, option);
    this.init();
  }
  init() {
    this.counter++;
    this.settings.id = `printArea_${this.counter}`;
    let url = "";
    if (this.settings.url && !this.settings.asyncUrl) {
      url = this.settings.url;
    }
    let _this = this;
    if (this.settings.asyncUrl) {
      _this.settings.asyncUrl(function(url2) {
        let PrintAreaWindow2 = _this.getPrintWindow(url2);
        if (_this.settings.preview) {
          _this.previewIfrmaeLoad();
        } else {
          _this.print(PrintAreaWindow2);
        }
      }, _this.settings.vue);
      return;
    }
    let PrintAreaWindow = this.getPrintWindow(url);
    if (!this.settings.url) {
      this.write(PrintAreaWindow.doc);
    }
    if (this.settings.preview) {
      this.previewIfrmaeLoad();
    } else {
      this.print(PrintAreaWindow);
    }
  }
  addEvent(element, type, callback) {
    if (element.addEventListener) {
      element.addEventListener(type, callback, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, callback);
    } else {
      element["on" + type] = callback;
    }
  }
  previewIfrmaeLoad() {
    let box = document.getElementById("vue-pirnt-nb-previewBox");
    if (box) {
      let _this = this;
      let iframe = box.querySelector("iframe");
      this.settings.previewBeforeOpenCallback();
      this.addEvent(iframe, "load", function() {
        _this.previewBoxShow();
        _this.removeCanvasImg();
        _this.settings.previewOpenCallback();
      });
      this.addEvent(box.querySelector(".previewBodyUtilPrintBtn"), "click", function() {
        _this.settings.beforeOpenCallback();
        _this.settings.openCallback();
        iframe.contentWindow.print();
        _this.settings.closeCallback();
      });
    }
  }
  removeCanvasImg() {
    let _this = this;
    try {
      if (_this.elsdom) {
        let canvasList = _this.elsdom.querySelectorAll(".canvasImg");
        for (let i = 0; i < canvasList.length; i++) {
          canvasList[i].remove();
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  print(ifrmae) {
    var _this = this;
    let iframe = document.getElementById(this.settings.id) || ifrmae.f;
    let iframeWin = document.getElementById(this.settings.id).contentWindow || ifrmae.f.contentWindow;
    var _loaded = function() {
      iframeWin.focus();
      _this.settings.openCallback();
      iframeWin.print();
      iframe.remove();
      _this.settings.closeCallback();
      _this.removeCanvasImg();
    };
    _this.settings.beforeOpenCallback();
    _this.addEvent(iframe, "load", function() {
      _loaded();
    });
  }
  write(PADocument) {
    PADocument.open();
    PADocument.write(`${this.docType()}<html>${this.getHead()}${this.getBody()}</html>`);
    PADocument.close();
  }
  docType() {
    if (this.settings.standard === this.standards.html5) {
      return "<!DOCTYPE html>";
    }
    var transitional = this.settings.standard === this.standards.loose ? " Transitional" : "";
    var dtd = this.settings.standard === this.standards.loose ? "loose" : "strict";
    return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01${transitional}//EN" "http://www.w3.org/TR/html4/${dtd}.dtd">`;
  }
  getHead() {
    let extraHead = "";
    let links = "";
    let style = "";
    if (this.settings.extraHead) {
      this.settings.extraHead.replace(/([^,]+)/g, (m) => {
        extraHead += m;
      });
    }
    [].forEach.call(document.querySelectorAll("link"), function(item) {
      if (item.href.indexOf(".css") >= 0) {
        links += `<link type="text/css" rel="stylesheet" href="${item.href}" >`;
      }
    });
    let domStyle = document.styleSheets;
    if (domStyle && domStyle.length > 0) {
      for (let i = 0; i < domStyle.length; i++) {
        try {
          if (domStyle[i].cssRules || domStyle[i].rules) {
            let rules = domStyle[i].cssRules || domStyle[i].rules;
            for (let b = 0; b < rules.length; b++) {
              style += rules[b].cssText;
            }
          }
        } catch (e) {
          console.log(domStyle[i].href + e);
        }
      }
    }
    if (this.settings.extraCss) {
      this.settings.extraCss.replace(/([^,\s]+)/g, (m) => {
        links += `<link type="text/css" rel="stylesheet" href="${m}">`;
      });
    }
    return `<head><title>${this.settings.popTitle}</title>${extraHead}${links}<style type="text/css">${style}</style></head>`;
  }
  getBody() {
    let ids = this.settings.ids;
    ids = ids.replace(new RegExp("#", "g"), "");
    this.elsdom = this.beforeHanler(document.getElementById(ids));
    let ele = this.getFormData(this.elsdom);
    let htm = ele.outerHTML;
    return "<body>" + htm + "</body>";
  }
  beforeHanler(elsdom) {
    let canvasList = elsdom.querySelectorAll("canvas");
    for (let i = 0; i < canvasList.length; i++) {
      if (!canvasList[i].style.display) {
        let _parent = canvasList[i].parentNode;
        let _canvasUrl = canvasList[i].toDataURL("image/png");
        let _img = new Image();
        _img.className = "canvasImg";
        _img.style.display = "none";
        _img.src = _canvasUrl;
        _parent.appendChild(_img);
      }
    }
    return elsdom;
  }
  getFormData(ele) {
    let copy = ele.cloneNode(true);
    let copiedInputs = copy.querySelectorAll("input,select,textarea");
    let canvasImgList = copy.querySelectorAll(".canvasImg,canvas");
    let selectCount = -1;
    for (let i = 0; i < canvasImgList.length; i++) {
      let _parent = canvasImgList[i].parentNode;
      let item = canvasImgList[i];
      if (item.tagName.toLowerCase() === "canvas") {
        _parent.removeChild(item);
      } else {
        item.style.display = "block";
      }
    }
    for (let i = 0; i < copiedInputs.length; i++) {
      let item = copiedInputs[i];
      let typeInput = item.getAttribute("type");
      let copiedInput = copiedInputs[i];
      if (!typeInput) {
        typeInput = item.tagName === "SELECT" ? "select" : item.tagName === "TEXTAREA" ? "textarea" : "";
      }
      if (item.tagName === "INPUT") {
        if (typeInput === "radio" || typeInput === "checkbox") {
          if (item.checked) {
            copiedInput.setAttribute("checked", item.checked);
          }
        } else {
          try {
            copiedInput.value = item.value;
            copiedInput.setAttribute("value", item.value);
          } catch (e) {
          }
        }
      } else if (typeInput === "select") {
        selectCount++;
        for (let b = 0; b < ele.querySelectorAll("select").length; b++) {
          let select = ele.querySelectorAll("select")[b];
          !select.getAttribute("newbs") && select.setAttribute("newbs", b);
          if (select.getAttribute("newbs") == selectCount) {
            let opSelectedIndex = ele.querySelectorAll("select")[selectCount].selectedIndex;
            item.options[opSelectedIndex].setAttribute("selected", true);
          }
        }
      } else {
        copiedInput.innerHTML = item.value;
        copiedInput.setAttribute("html", item.value);
      }
    }
    return copy;
  }
  getPrintWindow(url) {
    var f = this.Iframe(url);
    return {
      f,
      win: f.contentWindow || f,
      doc: f.doc
    };
  }
  previewBoxShow() {
    let box = document.getElementById("vue-pirnt-nb-previewBox");
    if (box) {
      document.querySelector("html").setAttribute("style", "overflow: hidden");
      box.style.display = "block";
    }
  }
  previewBoxHide() {
    let box = document.getElementById("vue-pirnt-nb-previewBox");
    if (box) {
      document.querySelector("html").setAttribute("style", "overflow: visible;");
      box.querySelector("iframe") && box.querySelector("iframe").remove();
      box.style.display = "none";
    }
  }
  previewBox() {
    let box = document.getElementById("vue-pirnt-nb-previewBox");
    let previewBodyClass = "previewBody";
    if (box) {
      box.querySelector("iframe") && box.querySelector("iframe").remove();
      return {
        close: box.querySelector(".previewClose"),
        previewBody: box.querySelector(`.${previewBodyClass}`)
      };
    }
    let previewContent = document.createElement("div");
    previewContent.setAttribute("id", "vue-pirnt-nb-previewBox");
    previewContent.setAttribute("style", "position: fixed;top: 0px;left: 0px;width: 100%;height: 100%;background: white;display:none");
    previewContent.style.zIndex = this.settings.zIndex;
    let previewHeader = document.createElement("div");
    previewHeader.setAttribute("class", "previewHeader");
    previewHeader.setAttribute("style", "padding: 5px 20px;");
    previewHeader.innerHTML = this.settings.previewTitle;
    previewContent.appendChild(previewHeader);
    this.close = document.createElement("div");
    let close = this.close;
    close.setAttribute("class", "previewClose");
    close.setAttribute("style", "position: absolute;top: 5px;right: 20px;width: 25px;height: 20px;cursor: pointer;");
    let closeBefore = document.createElement("div");
    let closeAfter = document.createElement("div");
    closeBefore.setAttribute("class", "closeBefore");
    closeBefore.setAttribute("style", "position: absolute;width: 3px;height: 100%;background: #040404;transform: rotate(45deg); top: 0px;left: 50%;");
    closeAfter.setAttribute("class", "closeAfter");
    closeAfter.setAttribute("style", "position: absolute;width: 3px;height: 100%;background: #040404;transform: rotate(-45deg); top: 0px;left: 50%;");
    close.appendChild(closeBefore);
    close.appendChild(closeAfter);
    previewHeader.appendChild(close);
    this.previewBody = document.createElement("div");
    let previewBody = this.previewBody;
    previewBody.setAttribute("class", previewBodyClass);
    previewBody.setAttribute("style", "display: flex;flex-direction: column; height: 100%;");
    previewContent.appendChild(previewBody);
    let previewBodyUtil = document.createElement("div");
    previewBodyUtil.setAttribute("class", "previewBodyUtil");
    previewBodyUtil.setAttribute("style", "height: 32px;background: #474747;position: relative;");
    previewBody.appendChild(previewBodyUtil);
    this.previewBodyUtilPrintBtn = document.createElement("div");
    let previewBodyUtilPrintBtn = this.previewBodyUtilPrintBtn;
    previewBodyUtilPrintBtn.setAttribute("class", "previewBodyUtilPrintBtn");
    previewBodyUtilPrintBtn.innerHTML = this.settings.previewPrintBtnLabel;
    previewBodyUtilPrintBtn.setAttribute("style", "position: absolute;padding: 2px 10px;margin-top: 3px;left: 24px;font-size: 14px;color: white;cursor: pointer;background-color: rgba(0,0,0,.12);background-image: linear-gradient(hsla(0,0%,100%,.05),hsla(0,0%,100%,0));background-clip: padding-box;border: 1px solid rgba(0,0,0,.35);border-color: rgba(0,0,0,.32) rgba(0,0,0,.38) rgba(0,0,0,.42);box-shadow: inset 0 1px 0 hsla(0,0%,100%,.05), inset 0 0 1px hsla(0,0%,100%,.15), 0 1px 0 hsla(0,0%,100%,.05);");
    previewBodyUtil.appendChild(previewBodyUtilPrintBtn);
    document.body.appendChild(previewContent);
    return {
      close: this.close,
      previewBody: this.previewBody
    };
  }
  iframeBox(frameId, url) {
    let iframe = document.createElement("iframe");
    iframe.style.border = "0px";
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.right = "0px";
    iframe.style.top = "0px";
    iframe.setAttribute("id", frameId);
    iframe.setAttribute("src", url);
    return iframe;
  }
  Iframe(url) {
    let frameId = this.settings.id;
    url = !url ? new Date().getTime() : url;
    let _this = this;
    let iframe = this.iframeBox(frameId, url);
    try {
      if (!this.settings.preview) {
        document.body.appendChild(iframe);
      } else {
        iframe.setAttribute("style", "border: 0px;flex: 1;");
        let previewBox = this.previewBox();
        let previewBody = previewBox.previewBody;
        let close = previewBox.close;
        previewBody.appendChild(iframe);
        this.addEvent(close, "click", function() {
          _this.previewBoxHide();
        });
      }
      iframe.doc = null;
      iframe.doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow ? iframe.contentWindow.document : iframe.document;
    } catch (e) {
      throw new Error(e + ". iframes may not be supported in this browser.");
    }
    if (iframe.doc == null) {
      throw new Error("Cannot find document.");
    }
    return iframe;
  }
}
const addEvent = (element, type, callback) => {
  if (element.addEventListener) {
    element.addEventListener(type, callback, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + type, callback);
  } else {
    element["on" + type] = callback;
  }
};
var Print = {
  directiveName: "print",
  mounted(el, binding, vnode) {
    let vue = binding.instance;
    let id = "";
    addEvent(el, "click", () => {
      if (typeof binding.value === "string") {
        id = binding.value;
      } else if (typeof binding.value === "object" && !!binding.value.id) {
        id = binding.value.id;
        let ids = id.replace(new RegExp("#", "g"), "");
        let elsdom = document.getElementById(ids);
        if (!elsdom)
          console.log("id in Error"), id = "";
      } else {
        window.print();
        return;
      }
      localPrint();
    });
    const localPrint = () => {
      new Print$1({
        ids: id,
        vue,
        url: binding.value.url,
        standard: "",
        extraHead: binding.value.extraHead,
        extraCss: binding.value.extraCss,
        zIndex: binding.value.zIndex || 20002,
        previewTitle: binding.value.previewTitle || "\u6253\u5370\u9884\u89C8",
        previewPrintBtnLabel: binding.value.previewPrintBtnLabel || "\u6253\u5370",
        popTitle: binding.value.popTitle,
        preview: binding.value.preview || false,
        asyncUrl: binding.value.asyncUrl,
        previewBeforeOpenCallback() {
          binding.value.previewBeforeOpenCallback && binding.value.previewBeforeOpenCallback(vue);
        },
        previewOpenCallback() {
          binding.value.previewOpenCallback && binding.value.previewOpenCallback(vue);
        },
        openCallback() {
          binding.value.openCallback && binding.value.openCallback(vue);
        },
        closeCallback() {
          binding.value.closeCallback && binding.value.closeCallback(vue);
        },
        beforeOpenCallback() {
          binding.value.beforeOpenCallback && binding.value.beforeOpenCallback(vue);
        }
      });
    };
  }
};
Print.install = function(Vue) {
  Vue.directive("print", Print);
};
export { Print as default };
