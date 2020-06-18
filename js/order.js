var vm = new Vue({
  el: '#app',
  data() {
    return {
      current: 0,
      willShow: true,
      dropDownShow: false,
      username: '',
      accessToken: '',
      taxNumber: '',
      mobile: '',
      type: '',
      email: '',
      purchaserName: '',
      purchaserTaxpayerNumber: '',
      address: '',
      phone: '',
      purchaserBank: '',
      purchaserBankAccount: '',
      companyId: '',
      request: {},
      searchList: [],
      sendType: ''
    }
  },
  created() {
    //获取用户名
    this.username = this.GetQueryString("username");
    localStorage.setItem("username", this.username);
    //获取访问令牌
    this.accessToken = this.GetQueryString("accessToken");
    localStorage.setItem("accessToken", this.accessToken);
    //获取税号
    this.taxNumber = this.GetQueryString("taxNumber");
    localStorage.setItem("taxNumber", this.taxNumber);
    this.searchCompanies();
    this.getUser();
  },
  methods: {
    // 发票抬头列表下拉
    dropDown() {
      if (this.dropDownShow == true) {
        this.dropDownShow = false;
      } else {
        this.dropDownShow = true;
      }
    },
    // 抬头和税号拼接换行
    lineFeed(item) {
      if (!item.name) {
        return `<span>${item.name}<br/>${item.taxNumber}</span>`;
      }
      return `<span>${item.name}<br/>${item.taxNumber}</span>`;
    },
    // 获取地址栏URL参数
    GetQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    // 切换个人与单位
    tabChange(index) {
      this.current = index;
      index == 0 ? this.sendType = "企业" : this.sendType = "个人";
      if (this.willShow == true && this.sendType == "个人") {
        this.willShow = false;
      } else if (this.willShow == false && this.sendType == "企业") {
        this.willShow = true;
      }
      console.log(this.sendType);
    },
    // 企业抬头查询
    searchCompanyTitleList() {
      if (this.purchaserName.length >= 4) {
        axios.get("https://fapiao-api.easyapi.com/company/codes", {
          params: {
            accessToken: this.accessToken,
            taxNumber: this.taxNumber,
            name: this.purchaserName
          }
        }).then(res => {
          this.searchList = res.data.content;
          this.dropDownShow = true;
        }).catch(error => {
          console.log(error)
        });
      }
    },
    chooseCompanyTitle(index) {
      this.purchaserName = this.searchList[index].name;
      this.purchaserTaxpayerNumber = this.searchList[index].taxNumber;
      this.address = this.searchList[index].address;
      this.phone = this.searchList[index].phone;
      this.purchaserBank = this.searchList[index].bank;
      this.purchaserBankAccount = this.searchList[index].bankAccount;
      this.dropDownShow = false;
    },
    // 获取用户默认的抬头、接受方式、抬头类型 信息
    getUser() {
      axios.get("https://fapiao-api.easyapi.com/api/default/" + this.username, {
        params: {
          accessToken: this.accessToken,
          taxNumber: this.taxNumber,
          appKey: this.appKey,
          appSecret: this.appSecret
        }
      }).then(res => {
        this.type = res.data.content.type;
        this.email = res.data.content.email;
        this.mobile = res.data.content.mobile;
        this.purchaserName = res.data.content.company.name;
        this.purchaserTaxpayerNumber = res.data.content.company.taxNumber;
        this.address = res.data.content.company.address;
        this.phone = res.data.content.company.phone;
        this.purchaserBank = res.data.content.company.bank;
        this.purchaserBankAccount = res.data.content.company.bankAccount;
        if (this.type == "企业") {
          this.current = 0;
          this.willShow = true;
        } else {
          this.willShow = false;
          this.current = 1;
        }
        this.companyId = res.data.content.company.companyId;
      }).catch(error => {
        console.log(error)
      });
    },
    // 获取发票公司抬头列表
    searchCompanies() {
      axios.get("https://fapiao-api.easyapi.com/companies", {
        params: {
          accessToken: this.accessToken,
          username: this.username
        }
      }).then(res => {
        let defaultList = res.data.content;
        for (let k in defaultList) {
          defaultList[k].name = defaultList[k].name;
          defaultList[k].taxNumber = defaultList[k].taxNumber;
          defaultList[k].address = defaultList[k].address;
          defaultList[k].phone = defaultList[k].phone;
          defaultList[k].bank = defaultList[k].bank;
          defaultList[k].bankAccount = defaultList[k].bankAccount;
        }
        this.searchList = defaultList;
      }).catch(error => {
        console.log(error)
      });
    },
    // 更新用户的默认抬头、接收方式
    saveAndUpload() {
      if (this.email.trim() === '') {
        alert("邮箱不能为空");
        document.getElementById("submit").href = "javascript:;"
        return;
      }
      if (this.purchaserName.trim() === '') {
        alert("发票抬头不能为空");
        document.getElementById("submit").href = "javascript:;"
        return;
      }
      this.request.email = this.email.trim();
      this.request.mobile = this.mobile.trim();
      this.request.companyId = this.companyId;
      this.request.purchaserName = this.purchaserName.trim();
      this.request.purchaserTaxpayerNumber = this.purchaserTaxpayerNumber.trim();
      this.request.address = this.address.trim();
      this.request.phone = this.phone.trim();
      this.request.purchaserBank = this.purchaserBank.trim();
      this.request.purchaserBankAccount = this.purchaserBankAccount.trim();
      this.request.username = this.username;
      this.request.accessToken = this.accessToken;
      this.request.taxNumber = this.taxNumber;
      this.request.type = this.sendType;
      this.request.category = "增值税电子普通发票";
      this.request.contentType = "商品明细";
      this.request.property = "电子";
      axios.put("https://fapiao-api.easyapi.com/api/default/" + this.username,
        this.request
      ).then(res => {
        window.parent.postMessage(JSON.stringify(this.request), "*");
      }).catch(error => {
        console.log(error);
      });
    }
  }
});
