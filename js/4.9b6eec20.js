(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[4],{"403f":function(t,a,e){},"4d91":function(t,a,e){"use strict";e("403f")},"81f2":function(t,a,e){"use strict";e.r(a);var s,n,o,r=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("q-page",[e("q-input",{staticClass:"q-my-sm q-px-sm full-width",attrs:{dense:"",outlined:"",autofocus:""},scopedSlots:t._u([{key:"append",fn:function(){return[""===t.searchValue?e("q-icon",{attrs:{name:"search"}}):e("q-icon",{staticClass:"cursor-pointer",attrs:{name:"clear"},on:{click:function(a){t.searchValue=""}}})]},proxy:!0}]),model:{value:t.searchValue,callback:function(a){t.searchValue=a},expression:"searchValue"}}),e("q-btn-dropdown",{staticClass:"q-mx-sm",attrs:{"no-caps":"",label:"Sort by: "+t.sortedBy}},t._l(t.sortType,(function(a){return e("q-list",{key:a},[e("q-item",{directives:[{name:"close-popup",rawName:"v-close-popup"}],attrs:{clickable:""},on:{click:function(e){return t.updateSortedBy(a)}}},[e("q-item-section",[e("q-item-label",[t._v(t._s(a))])],1)],1)],1)})),1),e("q-btn-dropdown",{attrs:{"no-caps":"",label:"Filters"},on:{input:t.updateFilters}},[e("q-option-group",{staticClass:"q-mr-sm",attrs:{type:"checkbox",options:t.statusList},model:{value:t.filters,callback:function(a){t.filters=a},expression:"filters"}})],1),e("div",{staticClass:"q-mt-sm q-px-sm full-width",staticStyle:{display:"inline-block"}},t._l(t.filteredMangaList,(function(a){return e("q-intersection",{key:a.url,staticClass:"q-mb-sm full-width manga-item"},[e("q-card",{class:{"completed-container":a.status===t.status.COMPLETED,"on-hold-container":a.status===t.status.ON_HOLD,"plan-to-read-container":a.status===t.status.PLAN_TO_READ,"dropped-container":a.status===t.status.DROPPED}},[e("q-card-section",{staticClass:"manga-item",attrs:{horizontal:""}},[e("q-img",{staticClass:"manga-image q-ma-sm",attrs:{contain:"",src:a.image},scopedSlots:t._u([{key:"error",fn:function(){return[e("q-icon",{staticClass:"full-width full-height",attrs:{size:"xl",name:"image_not_supported"}})]},proxy:!0}],null,!0)}),e("q-card-section",{staticClass:"q-pb-none q-pl-sm q-pr-none flex-column-between"},[e("div",{staticClass:"q-mb-sm"},[e("div",{staticClass:"text-h6"},[e("a",{attrs:{href:a.url}},[t._v(t._s(a.title))])]),e("div",{staticClass:"text-body2 manga-subtitle"},[t._v("\n                Progress: "),a.readUrl?e("a",{attrs:{href:a.readUrl}},[t._v(t._s(a.read))]):e("span",[t._v(t._s(a.read))])]),a.notes?e("div",{staticClass:"text-body2 manga-subtitle"},[t._v("\n                Notes:   "),e("span",[t._v(t._s(a.notes))])]):t._e(),a.rating?e("q-rating",{staticClass:"q-mt-sm",attrs:{readonly:"",size:"1em",max:10,color:a.rating>6?"positive":a.rating>3?"warning":"negative"},model:{value:a.rating,callback:function(e){t.$set(a,"rating",e)},expression:"manga.rating"}}):t._e()],1),e("div",{staticClass:"text-body2"},[e("q-icon",{staticClass:"q-mr-xs q-mb-xs",attrs:{name:t.statusIcon[a.status],size:"xs"}}),e("span",[t._v(t._s(t.siteName[a.site]))])],1)])],1)],1)],1)})),1)],1)},i=[],c=e("e4fd");(function(t){t["READING"]="Reading",t["COMPLETED"]="Completed",t["ON_HOLD"]="On hold",t["PLAN_TO_READ"]="Plan to read",t["DROPPED"]="Dropped"})(s||(s={})),function(t){t["Reading"]="import_contacts",t["Completed"]="done",t["On hold"]="pause",t["Plan to read"]="date_range",t["Dropped"]="delete"}(n||(n={})),function(t){t["TITLE"]="Title",t["SITE"]="Site",t["PROGRESS"]="Progress",t["RATING"]="Rating"}(o||(o={}));var l,u=e("bc3a"),d=e.n(u),m=e("e762");function p(t,a,e){switch(e){case o.SITE:return g(t,a);case o.PROGRESS:return f(t,a);case o.RATING:return h(t,a);default:return b(t,a)}}function g(t,a){return t.site.toLowerCase()>a.site.toLowerCase()?1:a.site.toLowerCase()>t.site.toLowerCase()?-1:b(t,a)}function f(t,a){return t.readNum&&a.readNum?t.readNum>a.readNum?1:a.readNum>t.readNum?-1:b(t,a):t.read&&a.read?t.read.toLowerCase()>a.read.toLowerCase()?1:a.read.toLowerCase()>t.read.toLowerCase()?-1:b(t,a):b(t,a)}function h(t,a){return t.rating&&a.rating?a.rating-t.rating:t.rating?-1:a.rating?1:b(t,a)}function b(t,a){return t.title.toLowerCase()>a.title.toLowerCase()?1:a.title.toLowerCase()>t.title.toLowerCase()?-1:0}(function(t){t["manganelo.com"]="Manganelo",t["webtoons.com"]="Webtoons",t["hatigarmscanz.net"]="Hatigarm Scans",t["1stkissmanga.com"]="1st Kiss Manga",t["mangakakalot.com"]="Mangakakalot",t["mangadex.org"]="MangaDex",t["mangakomi.com"]="Manga Komi",t["methodscans.com"]="Method Scans",t["leviatanscans.com"]="Leviatan Scans",t["hiperdex.com"]="HiperDEX",t["reaperscans.com"]="Reaper Scans",t["mangadods.com"]="MangaDoDs",t["asurascans.com"]="Asura Scans",t["manhwa.club"]="Manhwa Club",t["mangatx.com"]="MangaTx",t["mangago.me"]="Mangago",t["kitsu.io"]="Kitsu",t["skscans.com"]="Sleeping Knight Scans",t["zeroscans.com"]="Zero Scans",t["secretscans.co"]="Secret Scans"})(l||(l={}));var C=Object(c["defineComponent"])({name:"PageManga",data(){return{mangaList:[],searchValue:"",filters:[],sortedBy:o.TITLE,status:s,statusIcon:n,siteName:l,sortType:o}},computed:{filteredMangaList(){return this.mangaList.filter((t=>t.title.toLowerCase().includes(this.searchValue.toLowerCase())&&this.filters.includes(t.status))).sort(((t,a)=>p(t,a,this.sortedBy)))},statusList(){return Object.values(s).map((t=>({label:t,value:t})))}},mounted(){const t=localStorage.getItem("filters")||JSON.stringify(Object.values(s));this.filters=JSON.parse(t);const a=localStorage.getItem("sorted_by")||o.TITLE;this.sortedBy=a;const e=this.$route.query.id;void 0!==e&&d.a.get(`https://gitlab.com/api/v4/snippets/${e}/raw`).then((t=>{let a=t.data;a=m["a"].decode(a),a=a.substring(a.indexOf("["),a.lastIndexOf("]")+1).trim();const e=JSON.parse(a);this.mangaList=e})).catch((t=>console.error(t)))},methods:{updateSortedBy(t){this.sortedBy=t,localStorage.setItem("sorted_by",t)},updateFilters(){localStorage.setItem("filters",JSON.stringify(this.filters))}}}),q=C,w=(e("4d91"),e("2877")),_=e("9989"),v=e("27f9"),L=e("0016"),S=e("f20b"),y=e("1c1c"),x=e("66e5"),O=e("4074"),k=e("0170"),I=e("9f0a"),N=e("ad56"),D=e("f09f"),E=e("a370"),T=e("068f"),P=e("daf4"),R=e("7f67"),M=e("eebe"),Q=e.n(M),A=Object(w["a"])(q,r,i,!1,null,"18c60630",null);a["default"]=A.exports;Q()(A,"components",{QPage:_["a"],QInput:v["a"],QIcon:L["a"],QBtnDropdown:S["a"],QList:y["a"],QItem:x["a"],QItemSection:O["a"],QItemLabel:k["a"],QOptionGroup:I["a"],QIntersection:N["a"],QCard:D["a"],QCardSection:E["a"],QImg:T["a"],QRating:P["a"]}),Q()(A,"directives",{ClosePopup:R["a"]})}}]);