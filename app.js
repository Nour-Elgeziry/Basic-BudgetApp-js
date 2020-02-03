// BUDGET CONTROLLER
var budgetController = (function() {
  // function constructors
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  /* Income.prototype.calcPercentage = function(totalIncome) {
    this.percentage = Math.round((this.value / totalIncome) * 100);
  };
*/
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };

  // Data structure
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // creating new item based on inc or exp type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push it into the data structure
      data.allItems[type].push(newItem);

      // returninng the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      // calculate total income and exoenses
      calculateTotal("exp");
      calculateTotal("inc");

      // calculate the budget: income - exopenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the poercentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });

      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        totalPercentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();
//------------------------------------ " UI CONTROLLER " --------------------------------------
//UI CONTROLLER

var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container"
  };

  return {
    // returned to the UIcontroler function

    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // either inc or exp sign
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      //Create html string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description" >%description%</div > <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description" >%description%</div > <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
      }

      // Replaceee PH text with actual data

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value", obj.value);

      //Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      var element;
      element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      var fields, fieldsArray;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, arrary) {
        current.value = "";
      });
      fieldsArray[0].focus();
    },
    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent =
        obj.totalExp;

      if (obj.totalPercentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.totalPercentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          " --- ";
      }
    },
    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();
//------------------------------------ " Global CONTROLLER " ----------------------------------

//GLOBAL CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAdditem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAdditem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };
  var updateBudget = function() {
    // 1. Calculate Buget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. display budget
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function() {
    //1. calculate percentages

    budgetController.calculatePercentages();
    //2. read percentage from the budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. update the UI with the new percentsges
    console.log(percentages);
  };

  var ctrlAdditem = function() {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to budget controller\
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add new item to user interface
      UICtrl.addListItem(newItem, input.type);

      // 4. clear fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      //6. calculate and update percentage
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. delete item from the data structure
      budgetCtrl.deleteItem(type, ID);
      //2. delete the item from the UI
      UICtrl.deleteListItem(itemID);
      //3. update and show the new budget
      updateBudget();
      //4. calculate and update percentage
      updatePercentage();
    }
  };

  return {
    init: function() {
      console.log("Application has started");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        totalPercentage: -1
      });

      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
