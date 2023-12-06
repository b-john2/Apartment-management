const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/appartmentRental";
function regPage(type) {
    if (type == 'reg') {
        $("#regPageId").show();
        $("#loginPageId").hide();

    } else {
        location.reload();
    }

}
function isContainNull(value) {
    return value === "" || value === undefined || value === null ? true : false;
}
function nextJump(elm) {
    var current_fs, next_fs, previous_fs; //fieldsets
    var opacity;
    current_fs = $(elm).parent();
    next_fs = $(elm).parent().next();

    //Add Class Active
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate({ opacity: 0 }, {
        step: function (now) {
            // for making fielset appear animation
            opacity = 1 - now;

            current_fs.css({
                'display': 'none',
                'position': 'relative'
            });
            next_fs.css({ 'opacity': opacity });
        },
        duration: 600
    });
}
function dataRegister(elm) {
    let requestBody = {};
    let inputs = $("#msform").find('input:text,input[name="email"], input:password, input:file, select, textarea')
        .each(function () {
            requestBody[$(this).attr('name')] = $(this).val();
        });
    $.ajax({
        type: 'get',
        contentType: "application/json",
        dataType: 'json',
        cache: false,
        url: URL + "/userLoginRegister.json",
        success: function (response) {
            let loginUserList = [];
            for (let i in response) {
                let data = response[i];
                data["userId"] = i;
                loginUserList.push(data);
            }
            for (let i = 0; i < loginUserList.length; i++) {
                if ((loginUserList[i].uname == requestBody['uname'])) {
                    alert("User Name is already Registered");
                    return false;
                }
            }
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/userLoginRegister.json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    nextJump(elm);
                }, error: function (error) {
                    alert("Oops");
                }
            });

        }, error: function (error) {
            alert("Oops");
        }
    });

}
function loginUser() {

    if (isContainNull($("#userNameId").val()) || isContainNull($("#pwdId").val())) {
        alert("Please fill Required Data");

    } else {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/userLoginRegister.json",
            success: function (response) {
                let loginUserList = [];
                for (let i in response) {
                    let data = response[i];
                    data["userId"] = i;
                    loginUserList.push(data);
                }
                let isValidUser = false;
                for (let i = 0; i < loginUserList.length; i++) {
                    if ((loginUserList[i].uname == $("#userNameId").val()) && loginUserList[i].pwd == $("#pwdId").val()) {
                        isValidUser = true;
                        localStorage.setItem("userName", loginUserList[i].userType);
                        localStorage.setItem("userId", loginUserList[i].userId);
                        localStorage.setItem("userData", JSON.stringify(loginUserList[i]));
                        $("#userNameId").val('');
                        window.location.href = "appartmentRental.html";

                    }
                }
                if (!isValidUser) {
                    alert("User not found!! please do register");
                }

            }, error: function (error) {
                alert("Oops");
            }
        });
    }
}
$(document).ready(function () {
    $("#loginPageId").show();
    $("#regPageId").hide();


    $(".next").click(function () {
        isvalid = true;
        let inputs = $(this).parent().find('input:text, input:password, input:file,input[name="email"], select, textarea')
            .each(function () {
                if (isContainNull($(this).val()) && $(this).prop('disabled') != true) {
                    isvalid = false;
                }
            });
        if (!isvalid) {
            alert("Please fill all required data!!!");
        }
        if (isvalid) {
            if ($(this).hasClass('submit')) {
                dataRegister(this);
            } else {
                nextJump(this);
            }
        }
    });

    $(".previous").click(function () {
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        //Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        //show the previous fieldset
        previous_fs.show();

        //hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
            step: function (now) {
                // for making fielset appear animation
                opacity = 1 - now;

                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                previous_fs.css({ 'opacity': opacity });
            },
            duration: 600
        });
    });

    $('.radio-group .radio').click(function () {
        $(this).parent().find('.radio').removeClass('selected');
        $(this).addClass('selected');
    });

});
