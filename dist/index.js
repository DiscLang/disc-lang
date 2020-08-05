!function(){function t(t=null){this.identifiers={},this.parent=t}t.prototype={define:function(t,e){Object.defineProperty(this.identifiers,t,{get:function(){return e},set:function(){throw new Error(`Cannot update ${t}. It is a constant value.`)}})},initialize:function(t,e){const n=typeof e;let i=e;Object.defineProperty(this.identifiers,t,{get:function(){return i},set:function(e){if(typeof e!==n)throw new Error(`Cannot assign '${e}' to '${t}'. New value type must be '${n}'`);i=e}})},read:function(t){if(void 0!==this.identifiers[t])return this.identifiers[t];if(null!==this.parent)return this.parent.read(t);throw new Error(`Cannot read variable '${t}'. It has not been created.`)},update:function(t,e){if(void 0!==this.identifiers[t])this.identifiers[t]=e;else{if(null===this.parent)throw new Error(`Cannot update variable '${t}'. It has not been created.`);this.parent.update(t,e)}},new:function(){return t.new(this)},getIdentifiers:function(){return Object.keys(this.identifiers)}},t.new=function(e){return new t(e)};function e(){}function n(){const t=new e;return Object.freeze(t)}function i(){this.map={}}function o(t,e,n){if("number"!=typeof e||"number"!=typeof n)throw new Error(`All values provided to ${t} must be numbers; values received are: ${e} of type ${typeof e} and ${n} of type ${typeof n}`)}e.prototype={toString:()=>"nil"},i.prototype={getSafeKey:function(t){if("string"!=typeof t)throw new Error("Dictionary keys can only be strings.");return t.toLowerCase()},keys:function(){return Object.keys(this.map)},hasKey:function(t){const e=this.getSafeKey(t);return void 0!==this.map[e]},read:function(t){const e=this.getSafeKey(t);return void 0!==this.map[e]?this.map[e]:n()},remove:function(t){const e=this.getSafeKey(t);this.map[e]=void 0,delete this.map[e]},set:function(t,e){return this.getSafeKey(t),this.map[e],this},toString:function(){return JSON.stringify(this.map)}};const r=["true","false"],s=["be","as","to","with","while"],u=["loop","repeat","if","else"],c=["::","toInfix"],a={operators:["+","-","*","/"],openGroupDelimiter:"(",closeGroupDelimiter:")",functionExecutionIndicator:":",stringBeginIndicator:'"',stringEndIndicator:'"',stringEscapeCharacter:"\\",commentCharacter:"#",whitespaceCharacter:" ",subtractionToken:"-"},f=["isGreaterThan","isLessThan","isGreaterOrEqualTo","isLessOrEqualTo","isEqualTo"].map(t=>t.toLowerCase()),h={Number:t=>/^\-?[0-9]+(\.[0-9]+)?$/.test(t),Boolean:t=>r.includes(t.toLowerCase()),String:t=>t[0]===a.stringBeginIndicator&&t[t.length-1]===a.stringEndIndicator,InfixOperator:t=>c.includes(t),Operator:t=>a.operators.concat(["and","or"]).concat(f).includes(t),FunctionExecutionIndicator:t=>t===a.functionExecutionIndicator,OpenGroupDelimiter:t=>t===a.openGroupDelimiter,CloseGroupDelimiter:t=>t===a.closeGroupDelimiter,OpenBlockDelimiter:t=>"begin"===t.toLowerCase(),CloseBlockDelimiter:t=>"end"===t.toLowerCase(),TransitionalOperator:t=>s.includes(t.toLowerCase()),CallOperator:t=>"call"===t.toLowerCase(),ControlOperator:t=>u.includes(t.toLowerCase()),Identifier:()=>!0},p=Object.keys(h).map(t=>({type:t,test:h[t]}));var l={grammarTypes:Object.keys(h).reduce((function(t,e){return t["is"+e]=h[e],t}),{}),tokenTypes:Object.keys(h).reduce((function(t,e){return t[e]=e,t}),{}),getTokenType:function(t){const e=p.filter(e=>e.test(t)).map(t=>t.type)[0];if(void 0===e)throw new Error("Unknown value or symbol in source code: "+t);return e},characterSet:a};l.tokenTypes;const{stringBeginIndicator:d,stringEndIndicator:y,stringEscapeCharacter:g,commentCharacter:m,whitespaceCharacter:w,subtractionToken:b}=l.characterSet;function S(t){this.type="BinaryExpression",this.operator=t}const v={"+":(t,e)=>t+e,"-":(t,e)=>t-e,"*":(t,e)=>t*e,"/":(t,e)=>t/e},$={and:(t,e)=>t&&e,or:(t,e)=>t||e};function x(t,e){return function(n,i){if("number"!=typeof n||"number"!=typeof i)throw new Error(`Cannot compare non-number values with ${t} operator.`);return e(n,i)}}const E={isgreaterghan:x("isGreaterThan",(t,e)=>t>e),islessthan:x("isLessThan",(t,e)=>t<e),isgreaterorequalto:x("isGreaterOrEqualTo",(t,e)=>!(t<e)),islessorequalto:x("isLessOrEqualTo",(t,e)=>!(t>e)),isequalto:(t,e)=>t===e};S.prototype={setLeft:function(t){this.left=t},setRight:function(t){this.right=t},toString:function(){return`${this.left.toString()} ${this.operator} ${this.right.toString()}`},execute:function(t){const e=this.left.execute(t),n=this.right.execute(t);return Object.keys(v).includes(this.operator)?function(t,e,n){if("number"!=typeof e||"number"!=typeof n)throw new Error(`Arithmetic operations can only be run on numbers. Received ${e} of type ${typeof e} && ${n} of type ${typeof n}.`);return v[t](e,n)}(this.operator,e,n):Object.keys(E).includes(this.operator)?(i=this.operator,o=e,r=n,E[i](o,r)):function(t,e,n){return $[t](e,n)}(this.operator,e,n);var i,o,r}},S.new=function(t){return new S(t)};var C=function(t,e){return e.split("\n").map(e=>t+e).join("\n")};function k(t,e){this.type="Conditional",this.blockType=t,this.condition=e,this.success=[],this.fail=null}k.prototype={setSuccess:function(t){this.success=Array.isArray(t)?t:[]},setFail:function(t){null===this.fail?this.fail=t:this.fail.setFail(t)},toString:function(){const t=`${blockType} ${"else"!==blockType?this.condition.toString():""}`,e=this.success.map(t=>C("    ",t.toString()));let n=[t].concat(e);return null!==this.fail&&n.concat(this.fail.toString()),"if"===this.blockType&&n.concat("end"),n.join("\n")},execute:function(t){const e=t.new();if(this.condition.execute(e))for(let n=0;n<this.success.length;n++)this.success[n].execute(e);else null!==this.fail&&this.fail.execute(t)}},k.new=function(t,e){return new k(t,e)};function T(t){this.type="FunctionCall",this.name=t,this.arguments=[]}T.prototype={addArguments:function(t){this.arguments=t},toString:function(){const t=this.arguments.map(t=>t.toString());return[this.name+":"].concat(t).join(" ")},execute:function(t){const e=t.read(this.name);if("function"!=typeof e)throw new Error(`Cannot call ${this.name}, it is not a function.`);{const n=this.arguments.map(e=>e.execute(t));return e.apply(null,n)}}},T.new=function(t){return new T(t)};function O(){this.type="Group",this.body}O.prototype={setBody:function(t){this.body=t},toString:function(){return`(${this.body.toString()})`},execute:function(t){return this.body.execute(t)}},O.new=function(){return new O};function I(t){this.type="Identifier",this.name=t}I.prototype={toString:function(){return this.name},execute:function(t){return t.read(this.name)}},I.new=function(t){return new I(t)};function j(t,e,n){this.type="InitializationExpression",this.variableType=t,this.identifier=e,this.value=n}j.prototype={toString:function(){return"let"===this.variableType?`let ${this.identifier.toString()} be ${this.value.toString()}`:`define ${this.identifier.toString()} as ${this.value.toString()}`},execute:function(t){const e=this.value.execute(t);return"let"===this.variableType?t.initialize(this.identifier.name,e):t.define(this.identifier.name,e),e}},j.new=function(t,e,n){return new j(t,e,n)};function L(t){this.type="Literal",this.value=function(t){switch(t.type){case"String":return t.token.replace(/^\"(.*)\"$/,"$1");case"Number":return Number(t.token);case"Boolean":return"true"===t.token;default:return null}}(t)}L.prototype={toString:function(){return"string"==typeof this.value?`"${this.value}"`:this.value.toString()},execute:function(){return this.value}},L.new=function(t){return new L(t)};function B(t){this.type="Loop",this.condition=t,this.body=[]}B.prototype={setBody:function(t){this.body=t},toString:function(){const t="loop while "+this.condition.toString(),e=this.body.map(t=>C("    ",t.toString()));return[t].concat(e).concat(["end"]).join("\n")},execute:function(t){const e=t.new();for(;this.condition.execute(e);)for(let t=0;t<this.body.length;t++)this.body[t].execute(e)}},B.new=function(t){return new B(t)};function G(t){this.type="Program",this.body=t}G.prototype={addBodyNode:function(t){this.body.push(t)},toString:function(){const t=this.body.map(t=>C("    ",t.toString()));return["begin"].concat(t).concat("end").join("\n")},execute:function(t){this.body.forEach((function(e){e.execute(t)}))}},G.new=function(t){return new G(t)};function D(t,e){this.type="UpdateExpression",this.identifier=t,this.value=e}D.prototype={toString:function(){return`update ${this.identifier.toString()} to ${this.value.toString()}`},execute:function(t){const e=this.value.execute(t);return t.update(this.identifier.name,e),e}},D.new=function(t,e){return new D(t,e)}}();