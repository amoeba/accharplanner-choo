var html = require("choo/html");
// var devtools = require("choo-devtools");
var choo = require("choo");

var app = choo();
// app.use(devtools());
app.use(characterStore);
app.route("/", mainView);
app.mount("body");

function mainView(state, emit) {
  return html`
    <body>
      <p>
        Level: 
        
        <input type="range" min="1" max="275" onchange=${changeLevel} value=${
    state.level
  } />
        <input type="number" min="1" max="275" onchange=${changeLevel} value=${
    state.level
  } />

      </p>

    ${attributesView(state, emit)}
    </body>
  `;

  function changeLevel(event) {
    emit("changeLevel", event.target.value);
  }
}

function attributesView(state, emit) {
  return html`
    <ul>
      ${Object.keys(state.attributes).map(function(a) {
        return html`<li>
          ${a}
          <input type="range" min="10" max="100" data-attribute=${a} onchange=${changeAttribute} value=${state.attributes[a]} />
          <input type="number" min="10" max="100" data-attribute=${a} onchange=${changeAttribute} value=${state.attributes[a]} />
          
        </li>`;
      })}
    </ul>
  `;

  function changeAttribute(event) {
    emit("changeAttribute", {
      attribute: event.target.dataset.attribute,
      value: event.target.value
    });
  }
}

function characterStore(state, emitter) {
  state.level = 0;
  state.attributes = {
    strength: 10,
    endurance: 10,
    coordination: 10
  };

  emitter.on("changeLevel", function(level) {
    state.level = Number(level);
    emitter.emit("render");
  });

  emitter.on("changeAttribute", function(options) {
    console.log(options);
    state.attributes[options.attribute] = Number(options.value);
    emitter.emit("render");
  });
}
