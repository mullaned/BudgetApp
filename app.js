
//Budget Controller
var budgetController = (function(){
    
   var Expense = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
        this.percentage = Math.round((this.value / totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.gerPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
   };
    
    var calcTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1,
    };
    
    return {
        addItem: function(type,des,val){
            var newItem, ID;
            
            //Create new ID
            if(data.allItems[type].length >0){
               ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            }else{
                ID=0;
            }
            
            
            //Create new inc or exp depending on type
            if(type==='exp'){
                newItem = new Expense(ID,des,val);
            }else if(type==='inc'){
                newItem = new Income(ID,des,val);
            }
            
            //Push in to the data object
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type,id){
            var ids,index;
            
            ids = data.allItems[type].map(function(current){
               return current.id;
                
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            };
        },
        
        calculateBudget: function() {
            // calc total income and expenses
            calcTotal('exp');
            calcTotal('inc');
            
            // calc budget = income - exp
            data.budget = data.totals.inc - data.totals.exp;
            
            // cacl % of income that makes up exp
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            };
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(current){
                return current.gerPercentage();     
            });
            return allPercentages;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }  
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();


//UI Controller
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container',
        ExpensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num,type){
            var numSplit, int, dec, sign;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0]; 
            
            if(int.length > 3){
                int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3, 3);    
            };
            
            dec =numSplit[1];
            
            type === 'exp' ? sign = '-' : sign = '+'; 
            
            return sign + ' ' + int + '.' + dec;
        };
    
    var nodeListForEach = function(list,callback){
            for(var i = 0; i < list.length; i++){
                callback(list[i],i);    
            };    
        };
    
    return {
        getinput: function(){           
            return {
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };            
        },
        addListItem: function(obj,type){
            var html,newHtml,element;
            // 1. Create HTML string with placeholder tags
            if(type==='inc'){
                element=DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type=='exp'){
                element=DOMstrings.expensesContainer;
                
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }    
            
            // 2. Replace placeholder with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            // 3. Insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteLitsItem: function(selectorID){
            var element;
            
            element = document.getElementById(selectorID);
            
            element.parentNode.removeChild(element);
        },
        
        clearFields: function(){
            var fields,fieldsArr;    
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue); 
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+"%"; 
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
            
        },
        
        displayPercentages: function(percentagesArr) {
            
            var fields = document.querySelectorAll(DOMstrings.ExpensesPercentageLabel);
            
            nodeListForEach(fields,function(current, index){
                
                if(percentagesArr[index] > 0){
                    current.textContent = percentagesArr[index] + '%'; 
                }else{
                    current.textContent =  '---';
                };
            });
        },
        
        displayMonth: function(){
            var now,year,month,months;
            
            now = new Date();
            
            year = now.getFullYear();
            months = ['January', 'February','March','April','May','June','August','September','November','December'];
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' +year;
            
            month = now.getMonth();
        },
        
        changeType: function(){
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields,function(current){
                current.classList.toggle('red-focus');    
            })
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
})();


//Global App Controller
var controller = (function(budgetCtrl, UICtrl){
    
    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event){     
            if(event.keyCode===13 || event.which===13){          
                ctrlAddItem();
            }      
        });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };
    
    var updateBudget = function(){
        
        // 1. Calc budget
        budgetCtrl.calculateBudget();
        
        // 2. return budget
        var budget = budgetCtrl.getBudget();
        
        // 3. display budget in the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function(){
      
        // 1. Calc the percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read from budger controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update UI
        UICtrl.displayPercentages(percentages);
    };
    
    
    var ctrlAddItem = function(){
        var input,newItem;
        
        // 1. Get field input data
        input = UICtrl.getinput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value>0){
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);
        
            // 4. Clear the fields
            UICtrl.clearFields();
        
            // 5. Calc and update Budget
            updateBudget();
            
            // 6. Update percentages
            updatePercentages();
        };
        
        
        
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type,ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }
        
        // 1. Delete item from data structure
        budgetCtrl.deleteItem(type,ID);
        
        // 2. Delete item from UI
        UICtrl.deleteLitsItem(itemID);
        
        // 3. Update and show new budget
        updateBudget();
        
        // 4. Update percentages
        updatePercentages();
    };
    
    return {
        init: function(){
            console.log('App has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            } );
            setUpEventListeners();
        }
    };
    
})(budgetController,UIController);

controller.init();

