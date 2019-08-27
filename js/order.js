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
      upResult: {},
      searchList: [],
      sendType: ''
    }
  },
  created() {
    this.username = this.GetQueryString("username");// 获取用户名
    localStorage.setItem("username", this.username);
    this.accessToken = this.GetQueryString("accessToken"); // 获取accessToken
    localStorage.setItem("accessToken", this.accessToken);
    this.taxNumber = this.GetQueryString("taxNumber");// 获取taxNumber
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
          console.log(this.searchList);
          this.dropDownShow = true;
        }).catch(error => {
          console.log(error)
          //   MessageBox('提示', error.response.data.message);
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
      this.upResult.email = this.email;
      this.upResult.mobile = this.mobile;
      this.upResult.companyId = this.companyId;
      this.upResult.purchaserName = this.purchaserName;
      this.upResult.purchaserTaxpayerNumber = this.purchaserTaxpayerNumber;
      this.upResult.address = this.address;
      this.upResult.phone = this.phone;
      this.upResult.purchaserBank = this.purchaserBank;
      this.upResult.purchaserBankAccount = this.purchaserBankAccount;
      this.upResult.username = this.username;
      this.upResult.accessToken = this.accessToken;
      this.upResult.taxNumber = this.taxNumber;
      this.upResult.type = this.sendType;
      this.upResult.category = "增值税普通发票";
      this.upResult.contentType = "商品明细";
      this.upResult.property = "电子";
      axios.put("https://fapiao-api.easyapi.com/api/default/" + this.username,
        this.upResult
      ).then(res => {
        parent.closeInvoiceDialog();
      }).catch(error => {
        console.log(error);
      });
    }
  }
});