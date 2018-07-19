// Module Pattern (Start Header)
(function (peSA) {
    // Module Pattern (End Header)

    /**
     * peAdmin:  CRUD operations on Users, Stories, Chapters, Pages
     *
     */

        // Config
    peSA.consoleLogging = true;

    // Display All
    peSA.displayAll = function (form) {
        console.log("In displayAll.");
        getAll(form.typeField.value);
    };

    function getAll(type) {
        var route;
        var request = new XMLHttpRequest();

        request.onload = function () {
            var items;
            if (request.status == 200) {
                if (peSA.consoleLogging) {
                    console.log(request.responseText);
                }
                items = JSON.parse(request.responseText);
                if (peSA.consoleLogging) {
                    console.log(items);
                }
                addItemsToDisplay(items); // HERE
            }
            else {
                displayAllItemsError(); // HERE
            }
        };

        route = "/peApi/" + getTypeAsString(type);

        request.open("GET", route);
        request.send(null);

    }

    function addItemsToDisplay(items) {
        var listElem = document.getElementById("displayAllList");
        var i;

        // Clear list
        listElem.innerHTML = "";

        for (i = 0; i < items.length; i++) {
            var itemElem = document.createElement("li");
            itemElem.innerHTML = JSON.stringify(items[i]);
            listElem.appendChild(itemElem);
        }
    }

    function displayAllItemsError() {
        var listElem = document.getElementById("displayAllList");
        var itemElem = document.createElement("li");
        itemElem.innerHTML = "Bad Story Data!!";
        listElem.appendChild(itemElem);
    }

    // Find
    peSA.findItem = function (form) {
        getItemBy(form.searchKey.value, form.typeField.value);  // Note: Needs to be a valid ObjectID
    };

    function getItemBy(value, type) {
        var route;
        var request = new XMLHttpRequest();

        request.onload = function () {
            var item;
            if (request.status == 200) {
                if (peSA.consoleLogging) {
                    console.log(request.responseText);
                }
                item = JSON.parse(request.responseText);
                if (peSA.consoleLogging) {
                    console.log(item);
                }
                addItemByToDisplay(item);
            }
            else {
                displayItemByError(request.responseText);
            }
        }

        route = "/peApi/" + getTypeAsString(type) + "/";

        request.open("GET", route + value);
        request.send(null);

    }

    function addItemByToDisplay(item) {
        var form = document.updateItem;

        form.itemJSON.value = JSON.stringify(item);
    }

    function displayItemByError(msg) {
        var form = document.findItem;
        form.searchKey.value = msg;

    }

    // Create
    peSA.createItem = function (form) {
        var itemData = JSON.parse(form.newItemJSON.value);

        createItemWithValues(itemData, form.typeField.value);
    };

    function createItemWithValues(itemData, type) {
        var request = new XMLHttpRequest();
        var route;

        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var item = JSON.parse(request.responseText);
                    if (peSA.consoleLogging) {
                        console.log(request.responseText);
                    }
                    addItemCreateToDisplay(item);
                }
                else {
                    displayCreateItemError();
                }
            }
        }

        route = "/peAPI/" + getTypeAsString(type);

        request.open("POST", route);
        request.setRequestHeader("Content-Type", "application/json");

        request.send(JSON.stringify(itemData));
    }

    function addItemCreateToDisplay(item) {
        var divElem = document.getElementById("createItemDisplay");
        divElem.innerHTML = JSON.stringify(item);
    }

    function displayCreateStoryError() {
        var divElem = document.getElementById("createItemDisplay");
        divElem.innerHTML = "Create item failed.";
    }

    // Delete
    peSA.deleteItem = function (form) {
        deleteItemBy(form.searchKey.value, form.typeField.value);
    };

    function deleteItemBy(value, type) {
        var request = new XMLHttpRequest();
        var route;

        request.onload = function () {
            var item;
            if (request.status == 200) {
                if (peSA.consoleLogging) {
                    console.log(request.responseText);
                }
                item = request.responseText;  // Delete operation returns a string
                if (peSA.consoleLogging) {
                    console.log(item);
                }
                addDeleteByToDisplay(item);
            }
            else {
                displayDeleteByError();
            }
        }

        route = "/peAPI/" + getTypeAsString(type) + "/";

        request.open("DELETE", route + value);
        request.send(null);

    }

    function addDeleteByToDisplay(item) {
        var divElem = document.getElementById("deleteItemDisplay");
        divElem.innerHTML = item;  // Delete returns a string..not JSON
    }

    function displayDeleteByError() {
        var divElem = document.getElementById("deleteItemDisplay");
        divElem.innerHTML = "Delete Error.";
    }

    // Update
    peSA.updateItem = function (form) {
        var itemData = JSON.parse(form.itemJSON.value);
        var typeForm = document.findItem; // TODO:  This is problematic.  They could change type field.  Need to clear box if they do.

        updateItemWithValues(itemData, typeForm.typeField.value);
    };

    function updateItemWithValues(itemData, type) {
        var request = new XMLHttpRequest();
        var route;

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var item = JSON.parse(request.responseText);
                    if (peSA.consoleLogging) {
                        console.log(request.responseText);
                    }
                    addUpdateToDisplay("Successful Update.");
                }
                else {
                    displayUpdateError(request.responseText);
                }
            }
        }

        route = "/peAPI/" + getTypeAsString(type) + "/";

        request.open("PUT", route + itemData._id);
        request.setRequestHeader("Content-Type", "application/json");

        request.send(JSON.stringify(itemData));
    }

    function addUpdateToDisplay(msg) {
        var divElem = document.getElementById("updateItemDisplay");
        divElem.innerHTML = msg;  // Delete returns a string..not JSON

    }

    function displayUpdateError(msg) {
        var divElem = document.getElementById("updateItemDisplay");
        divElem.innerHTML = msg;
    }

    // Utility
    function getTypeAsString(type) {
        var retval;

        if (type === "1") {
            retval = "user";
        }
        if (type === "2") {
            retval = "story";
        }
        if (type === "3") {
            retval = "chapter";
        }
        if (type === "4") {
            retval = "event";
        } else {
            // Error, Invalid type
        }

        return retval;
    }

    // Module Pattern (Begin Footer)
})(window.peSA = window.peSA || {});
// Module Pattern (End Footer)
