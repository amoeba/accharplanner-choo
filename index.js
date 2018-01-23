var html = require("choo/html");
// var devtools = require("choo-devtools");
var choo = require("choo");

// Constants
const training = {
  SPECIALIZED: "SPECIALIZED",
  TRAINED: "TRAINED",
  UNTRAINED: "UNTRAINED",
  UNUSABLE: "UNUSABLE"
};

var app = choo();
// app.use(devtools());
app.use(characterStore);
app.route("/", mainView);
app.mount("body");

function mainView(state, emit) {
  emit("updateSkills");

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

      <p>
      Skill credits: ${skillCredits(state)}
      Extra skill creds:
      <input type="checkbox" checked=${state.skillCred} onchange=${skillCred} />
      </p>

      ${attributesView(state, emit)}
      ${skillsView(state, emit)}
      </body>
  `;

  function changeLevel(event) {
    emit("changeLevel", event.target.value);
  }

  function skillCredits(state) {
    return state.level + state.skillCred;
  }
  function skillCred(event) {
    emit("skillCred", event.target.checked);
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

function skillsView(state, emit) {
  return html`
  <div id="skills">
    <h2>Specialized</h2>

    <ul>
      ${Object.keys(state.skills)
        .filter(function(s) {
          return state.skills[s].training == training.SPECIALIZED;
        })
        .map(function(s) {
          return html`<li>
          ${s}: ${state.skills[s].value} (${state.skills[s].training})
          <button data-skill=${s} onclick=${decreaseTraining}>-</button>
          <button data-skill=${s} onclick=${increaseTraining}>+</button>
        </li>`;
        })}
    </ul>

    <h2>Trained</h2>

    <ul>
      ${Object.keys(state.skills)
        .filter(function(s) {
          return state.skills[s].training == training.TRAINED;
        })
        .map(function(s) {
          return html`<li>
          ${s}: ${state.skills[s].value} (${state.skills[s].training})
          <button data-skill=${s} onclick=${decreaseTraining}>-</button>
          <button data-skill=${s} onclick=${increaseTraining}>+</button>
        </li>`;
        })}
    </ul>

    <h2>Untrained</h2>

    <ul>
      ${Object.keys(state.skills)
        .filter(function(s) {
          return state.skills[s].training == training.UNTRAINED;
        })
        .map(function(s) {
          return html`<li>
          ${s}: ${state.skills[s].value} (${state.skills[s].training})
          <button data-skill=${s} onclick=${decreaseTraining}>-</button>
          <button data-skill=${s} onclick=${increaseTraining}>+</button>
        </li>`;
        })}
    </ul>

    <h2>Unusable</h2>

    <ul>
      ${Object.keys(state.skills)
        .filter(function(s) {
          return state.skills[s].training == training.UNUSABLE;
        })
        .map(function(s) {
          return html`<li>
          ${s}: ${state.skills[s].value} (${state.skills[s].training})
          <button data-skill=${s} onclick=${decreaseTraining}>-</button>
          <button data-skill=${s} onclick=${increaseTraining}>+</button>
        </li>`;
        })}
    </ul>
    </div>
  `;

  function decreaseTraining(event) {
    emit("decreaseTraining", event.target.dataset.skill);
  }

  function increaseTraining(event) {
    emit("increaseTraining", event.target.dataset.skill);
  }
}

function characterStore(state, emitter) {
  state.level = 1;
  state.skillCred = false;
  state.attributes = {
    strength: 10,
    endurance: 10,
    coordination: 10,
    quickness: 10,
    focus: 10,
    self: 10
  };
  state.skills = {
    alchemy: {
      value: -1,
      training: training.SPECIALIZED
    }
  };

  emitter.on("changeLevel", function(level) {
    state.level = Number(level);
    emitter.emit("render");
  });

  emitter.on("skillCred", function(checked) {
    state.skillCred = checked;
    emitter.emit("render");
  });

  emitter.on("changeAttribute", function(options) {
    state.attributes[options.attribute] = Number(options.value);
    emitter.emit("updateSkills");
    emitter.emit("render");
  });

  emitter.on("updateSkills", function(options) {
    Object.keys(state.skills).forEach(function(skill) {
      state.skills[skill].value = skillValue[skill](state);
    });
  });

  emitter.on("increaseTraining", function(skill) {
    var current = state.skills[skill].training;

    if (current == training.SPECIALIZED) {
      return;
    } else if (current == training.TRAINED) {
      state.skills[skill].training = training.SPECIALIZED;
    } else if (current == training.UNTRAINED) {
      state.skills[skill].training = training.TRAINED;
    } else if (current == training.UNUSABLE) {
      state.skills[skill].training = training.TRAINED;
    }

    emitter.emit("render");
  });

  emitter.on("decreaseTraining", function(skill) {
    var current = state.skills[skill].training;

    if (current == training.SPECIALIZED) {
      state.skills[skill].training = training.TRAINED;
    } else if (current == training.TRAINED) {
      state.skills[skill].training = training.UNTRAINED;
    }

    emitter.emit("render");
  });

  var skillValue = {
    alchemy: function(state) {
      return (
        Math.round(state.attributes.focus / 2) +
        trainingBonus(state.skills.alchemy.training)
      );
    }
  };

  function trainingBonus(current) {
    if (current === training.SPECIALIZED) {
      return 15;
    } else if (current === training.TRAINED) {
      return 5;
    } else {
      return 0;
    }
  }
}
