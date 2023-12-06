var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
    const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/appartmentRental";
    $scope.orderDetails = {};
    $("#orderDivId").show();
    $("#biilingId").hide();
    $("#iteamAddDivId").hide();
    $scope.editRequest = {};
    $scope.viewOrderTableData = [];
    $scope.userName = localStorage.getItem("userName");
    $scope.userId = localStorage.getItem("userId");
    $scope.loginUserData = localStorage.getItem("userData");
    $scope.loginUserData = JSON.parse($scope.loginUserData);
    getApartmentList();
    $scope.placeOrder = function (data, type) {
        $scope.isEdit = type;
        $scope.orderDetails = data;
        $scope.editRequest = { ...data };
        $scope.editRequest["tenantName"] = $scope.loginUserData.fname + ' ' + $scope.loginUserData.lname;
    }

    $scope.bookApartment = function () {
        let requestBody = { ...$scope.editRequest };
        requestBody["userId"] = $scope.userId;
        requestBody["ownerId"] = $scope.orderDetails.ownerId;
        requestBody["status"] = "pending";
        requestBody["currentUserContact"] = $scope.loginUserData.phon;
        delete requestBody['$$hashKey'];

        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/rentApartment.json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                $('#placeOrderModalId').modal('hide');
                $scope.switchMenu("BILLING", "billingTabId");
                alert("Booking Successfully Done");
            }, error: function (error) {
                alert("Oops");
            }
        });
    }
    $scope.getBookingData = function (type) {
        $scope.viewOrderTableData = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/rentApartment.json",
            success: function (response) {
                let vechBookList = [];
                for (let i in response) {
                    let data = response[i];
                    data["bookingId"] = i;
                    vechBookList.push(data);
                }
                if ($scope.userName == 'LANDLORDS') {
                    $scope.viewOrderTableData = vechBookList?.filter(function (obj) {
                        return obj.ownerId === $scope.userId;
                    });
                } else {
                    $scope.viewOrderTableData = vechBookList?.filter(function (obj) {
                        if ($scope.userId === obj.userId) {
                            if (type == "BILLING") {
                                return obj.status === "pending" || obj.status === 'Rejected';
                            } else {
                                return obj.status != "pending" && obj.status != 'Rejected';
                            }
                        }
                    })
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Oops");
            }
        });
    }
    $scope.getOrderData = function (data, type) {
        $("#ammountId").val(data.price);
        $scope.orderDetails = data;
        if (type != 'PAY') {
            $scope.payBill(type);
        }


    }
    $scope.payBill = function (type) {
        let statusType = '';
        let msg = '';
        switch (type) {
            case 'PAY':
                if ($("#paymentModeId").val() == "") {
                    alert("Please select payment mode");
                    return false;
                } else {
                    statusType = $("#paymentModeId").val();
                    msg = "Payment Successfully Done";
                }
                break;
            case 'ACCEPT':
                statusType = 'Accepted';
                msg = "Data Updated Successfully";
                break;
            case 'REJECT':
                statusType = 'Rejected';
                msg = "Data Updated Successfully";
                break;
        }

        let requestBody = {
            "status": statusType
        }
        $.ajax({
            type: 'patch',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/rentApartment/" + $scope.orderDetails.bookingId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                $('#processToPayModalId').modal('hide');
                $scope.getBookingData("HISTORY");
                alert(msg);
            }, error: function (error) {
                alert("Oops");
            }
        });
    }

    function getApartmentList() {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addNewApartment.json",
            success: function (lresponse) {
                $scope.appartmentDetailsList = [];
                let appartmentListData = []
                for (let i in lresponse) {
                    let data = lresponse[i];
                    data["newApartmentId"] = i;
                    appartmentListData.push(data);
                }
                if ($scope.userName == 'LANDLORDS') {
                    $scope.appartmentDetailsList = appartmentListData?.filter(function (obj) {
                        return obj.ownerId === $scope.userId;
                    })
                } else {
                    $scope.appartmentDetailsList = [...appartmentListData];
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Oops");
            }
        });
    }
    $scope.addApartment = function (operationType) {
        let requestBody = {};
        if (operationType === 'EDIT') {
            requestBody = { ...$scope.editRequest };
            methodType = 'patch';
            requestUrl = "/addNewApartment/" + $scope.orderDetails.newApartmentId + ".json"
            delete requestBody['$$hashKey'];
        } else if (operationType === 'ADD') {
            methodType = 'post';
            requestUrl = "/addNewApartment.json"
            requestBody = {
                "landlordNameId": $("#landlordNameId").val(),
                "landLordContactId": $("#landLordContactId").val(),
                "appartmentNameId": $("#appartmentNameId").val(),
                "price": $("#pricePerMonthId").val(),
                "mapLocation": $("#mapLocation").val(),
                "size": $("#size").val(),
                "address": $("#address").val(),
                "ownerId": $scope.userId,
                "imgUrl": $scope.apartmentImg,
                "facility": $("#facility").val()
            };
        }
        $.ajax({
            type: methodType,
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + requestUrl,
            data: JSON.stringify(requestBody),
            success: function (response) {
                if (operationType === 'EDIT') {
                    alert("Data Updated!!!");
                    getApartmentList();
                    $('#placeOrderModalId').modal('hide');
                }
                else if (operationType === 'ADD') {
                    alert("Data added!!!");
                    $("#pricePerMonthId").val('');
                    $('#apartmentImgId').next('.custom-file-label').html("Upload Apartment Photo");
                    $("#appartmentNameId").val('');
                    $("#landlordNameId").val('');
                    $("#landLordContactId").val('');
                    $("#mapLocation").val('');
                    $("#size").val('');
                    $("#address").val('');
                    $("#facility").val('');
                }
            }, error: function (error) {
                alert("Oops");
            }
        });
    }
    $scope.removeApartment = function (data) {
        $.ajax({
            type: 'delete',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addNewApartment/" + data.newApartmentId + ".json",
            success: function (response) {
                getApartmentList();
                alert("Removed successfuly !!!");
            }, error: function (error) {
                alert("Oops");
            }
        });

    }
    $scope.logout = function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "loginRegApartment.html";
    }
    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        $('#' + id).addClass("active");
        $("#orderDivId").hide();
        $("#biilingId").hide();
        $("#iteamAddDivId").hide();
        if (type == "MENU") {
            $("#orderDivId").show();
            getApartmentList();
        } else if (type == "ADD_APPARTMENT") {
            $("#iteamAddDivId").show();
        } else if (type == "BILLING") {
            $("#biilingId").show();
            $scope.getBookingData("BILLING");
        } else if (type == "HISTORY") {
            $("#biilingId").show();
            $scope.getBookingData("HISTORY");
        }
    }
    $(document).ready(function () {
        $('#placeOrderModalId').on('hidden.bs.modal', function (e) {
            $("#rentCostId").val("");
            $("#noOfDays").val("");
            $("#bookingDateId").val("");
            $("#rentCostId").val("");
        })
        $('#apartmentImgId').on('change', function () {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                $scope.apartmentImg = fileReader.result;  // data <-- in this var you have the file data in Base64 format
            };
            fileReader.readAsDataURL($('#apartmentImgId').prop('files')[0]);
            var file = $('#apartmentImgId')[0].files[0].name;
            $(this).next('.custom-file-label').html(file);
        });
    });
});
