function shapes(cobj, type, typeObj) {
    this.cobj = cobj;
    this.type = type || "stroke";

    if (typeof typeObj == "object") {
        this.strokeColor = typeObj.strokeColor || "#fff";
        this.fillColor = typeObj.fillColor || "#fff";
        this.strokeW = typeObj.strokeW || 1;
    }
}

shapes.prototype = {
    rect: function (x, y, x1, y1) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.x1 = x1 || this.x1;
        this.y1 = y1 || this.y1;
        this.cobj.strokeStyle = this.strokeColor;
        this.cobj.fillStyle = this.fillColor;
        this.cobj.lineWidth = this.strokeW;
        this.cobj[this.type + "Rect"](this.x, this.y, this.x1 - this.x, this.y1 - this.y);
        this.style = "rect";
        this.isSelected = false;
        if (this.isSelected) {
            this.strokeColor = "red";
            this.lineWidth = 10;
        }
    },
    line: function (x, y, x1, y1) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.x1 = x1 || this.x1;
        this.y1 = y1 || this.y1;
        this.cobj.strokeStyle = this.strokeColor;
        this.cobj.fillStyle = this.fillColor;
        this.cobj.lineWidth = this.strokeW;
        this.cobj.beginPath();
        this.cobj.moveTo(this.x, this.y);
        this.cobj.lineTo(this.x1, this.y1);
        this.cobj.stroke();
        this.style = "line";
        this.isSelected = false;
        if (this.isSelected) {
            this.strokeColor = "red";
            this.lineWidth = 10;
        }
    },
    circle: function (x, y, x1, y1) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.x1 = x1 || this.x1;
        this.y1 = y1 || this.y1;
        var ox = this.x;
        var oy = this.y;
        var r = Math.sqrt((this.x1 - this.x) * (this.x1 - this.x) + (this.y1 - this.y) * (this.y1 - this.y))
        var startA = 0;
        var endA = 2 * Math.PI;
        this.cobj.strokeStyle = this.strokeColor;
        this.cobj.fillStyle = this.fillColor;
        this.cobj.lineWidth = this.strokeW;
        this.cobj.beginPath();
        this.cobj.arc(ox, oy, r, startA, endA);
        this.cobj[this.type]();
        this.style = "circle";
        this.isSelected = false;
        if (this.isSelected) {
            this.strokeColor = "red";
            this.lineWidth = 10;
        }
    },

}

var arr = [];
var previousSelected;//记录前一个选中的圆
var isDragging = false;
function drag(canvas, cobj, type, attrobj) {
    isDragging = false;
    canvas.onmousedown = function (e) {
        //此处的type就是画图的类型
        var ox, oy, mx, my;
        ox = e.layerX;
        oy = e.layerY;
        var shapetype = attrobj.type
        var obj = new shapes(cobj, shapetype, attrobj);     //新画布，做离屏幕处理
        canvas.onmousemove = function (e) {
            cobj.clearRect(0, 0, canvas.width, canvas.height);
            mx = e.layerX;
            my = e.layerY;
            obj[type](ox, oy, mx, my);
            for (var i = 0; i < arr.length; i++) {
                
                arr[i][arr[i].style]()
            };
        }
        document.onmouseup = function () {
            document.onmouseup = null;
            canvas.onmousemove = null;
            if (obj.style == undefined || obj.style == "") {
                //如果不是拖拽操作
            }
            else
                arr.push(obj);      //将绘制的图形做队列处理
        }
    }
}
function Select(canvas, cobj) {
    canvas.onmousedown = function (e) {
        var ox, oy, mx, my;
        ox = e.offsetX;
        oy = e.offsetY;
        // 判断点击了哪个对象.
        for (var i = arr.length - 1; i >= 0 ; i--) {
            var selectobj = arr[i];
            if (IsQuery(selectobj, e)) {
                //alert(selectobj.style);
                if (previousSelected != null) previousSelected.isSelected = false;
                previousSelected = selectobj;//记录选中的对象
                selectobj.isSelected = true;
                // 可以被拖动
                isDragging = true;
            }
        }
        canvas.onmousemove = function (e) {
            if (isDragging == true) {
                if (previousSelected != null) {
                    cobj.clearRect(0, 0, canvas.width, canvas.height);
                    mx = e.offsetX;
                    my = e.offsetY;
                    var moveX = mx - ox;
                    var moveY = my - oy;
                    ox=mx;
                    oy=my;
                    console.log(mx+","+my);
                    previousSelected.x += moveX;;
                    previousSelected.x1 += moveX;
                    previousSelected.y += moveY;
                    previousSelected.y1 += moveY;
                 
                    for (var i = 0; i < arr.length; i++) {
                        arr[i][arr[i].style]()
                    };
                    document.onmouseup = function () {
                        isDragging = false;
                        document.onmouseup = null;
                        canvas.onmousemove = null;
                    }
                }
            }
        }
    }
}
function die(canvas, cobj, xiangpi) {
    canvas.onmousedown = function (e) {
        var ox, oy, mx, my;
        ox = e.layerX;
        oy = e.layerY;
        canvas.onmousemove = function (e) {
            mx = e.layerX;
            my = e.layerY;
            var data = cobj.getImageData(mx - 5, my - 5, 10, 10)


            for (var i = 0; i < data.width * data.height * 4; i++) {
                data.data[i] = 0;
            };
            cobj.putImageData(data, mx - 5, my - 5)
        }
        document.onmouseup = function () {
            document.onmouseup = null;
            canvas.onmousemove = null;
        }
    }
}
function IsQuery(obj, pt) {
    var minx, maxx, miny, maxy;
    if (obj.style == "circle") {
        var width = Math.abs(obj.x1 - obj.x);
        minx = obj.x - width;
        miny = obj.y - width;
        maxx = obj.x + width;
        maxy = obj.y + width;
    }
    if (obj.style == "rect") {
        minx = obj.x;
        miny = obj.y;
        maxx = obj.x1;
        maxy = obj.y1;
    }
    if (obj.style == "line") {
        minx = obj.x;
        miny = obj.y - 10;
        maxx = obj.x1;
        maxy = obj.y1 + 10;
    }
    if (pt.layerX > minx && pt.layerX < maxx && pt.layerY > miny && pt.layerY < maxy) {
        return true;
    }
    return false;
}