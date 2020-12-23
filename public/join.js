
	function display(){
		document.getElementById("button").style.display = 'flex';
		document.getElementById("button").style.cursor = 'context-menu';
	}
	function setcolor(){
		var text = document.getElementById("code").value;
		if (text != "") {
			document.getElementById("button").style.cursor = 'pointer';
			document.getElementById("button").style.color = '#006600';
		}
		else{
			document.getElementById("button").style.cursor = 'context-menu';
			document.getElementById("button").style.color = '#AAAAAA';
		}
    }
    function dieu_huong(){
        var text = document.getElementById("code").value;
        location.replace('/'+text);
    }
