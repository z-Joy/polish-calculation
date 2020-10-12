class MathOperation {
  constructor() {}

  /**
   * toFixed方法，解决精度问题
   * @param num
   * @param s
   * @param digital
   * @return res
   */
  toFixed (num = 0, s = 2, digital) {
      num = Number(num);
      if (isNaN(num)) {
          throw Error('无效入参');
      }
      const times = Math.pow(10, s);
      let precision = 0.5;
      if (num < 0) {
          precision = -0.5;
      }
      let des = num * times + precision; des = parseInt(des, 10) / times;
      let res = des.toFixed(s);
      if (digital) {
          return Number(res);
      }
      return res;
  }
  
  /**
   * 简单运算求值
   * @param fir 表达式第一位
   * @param sec 表达式第二位
   * @param operator 四则运算符号
   * @return res
   */
  getResult (fir, sec, operator) {
      switch (operator) {
          case '+': return fir + sec;
          case '-': return fir - sec;
          case '*': return fir * sec;
          case '/': return fir / sec;
          default: throw Error('无效的四则运算符号');
      }
  }

  /**
   * 比较运算符的优先级
   * @param fir 运算符1
   * @param sec 运算符2
   * @return boolean
   */
  comparePriority (fir, sec) {
      return ReversedPolishNotationUtils.getPriorityValue(fir) > ReversedPolishNotationUtils.getPriorityValue(sec);
  }

  /**
   * 获得运算符的优先级
   * @param str
   * @return number
   */
  static getPriorityValue (str) {
      switch (str) {
      case '+':
      case '-':
          return 1;
      case '*':
      case '/':
          return 2;
      default:
          throw Error('无效/不支持该类型的运算符！');
      }
  }
}

export default class ReversedPolishNotationUtils extends MathOperation {
  constructor () {
      super();
  }

  /**
   * 由中缀表达式计算出结果
   * @param str 中缀表达式
   * @param s 结果保留位数
   * @param digital 结果最终类型
   * @return res
   */
  getFixedCalculateResult (str, s = 2, digital = false) {
    return super.toFixed(this.calculateRpn(this.conversionRpn(str)), s, digital);
  }

  getCalculateResult (str) {
    return this.calculateRpn(this.conversionRpn(str));
  }

  /**
   * 由逆波兰表达式计算出结果
   * @param rpnQueue 逆波兰表达式
   * @return res
   */
  calculateRpn (rpnQueue) {
    const opStack = [];
    while (rpnQueue.length) {
      const current = rpnQueue.shift();

      if (!ReversedPolishNotationUtils.isOperator(current)) {
        opStack.push(current);
      } else {
        if (opStack.length < 2) {
          throw Error('后缀表达式格式有误');
        }
        const second = opStack.pop();
        const first = opStack.pop();
        opStack.push(super.getResult(first, second, current));
      }
    }

    if (opStack.length !== 1) {
      throw Error('后缀表达式格式有误');
    } else {
      return opStack[0];
    }
  }

  /**
   * 将中缀表达式转换为后缀表达式（逆波兰表达式）
   * @param str 中缀表达式
   * @return （逆波兰表达式）
   */
  conversionRpn (str) {
    let rpnRes = [];
    let opStack = [];
    const tempArr = str.replace(/([\-|\+|\*|\/|\(|\)])/g, ',$1,').split(',');
    // 当正负号开头时，添0处理
    for (let i in tempArr) {
      // 删除首尾空格
      let temp = this.trim(tempArr[i]);
      if (temp) {
        if (!ReversedPolishNotationUtils.isOperator(temp)) {
          break;
        } else if (temp === '(') {
          continue;
        } else if (temp === '+' || temp === '-') {
          tempArr.unshift('0');
          break;
        }
      }
    }
    for (let i in tempArr) {
      // 去空格处理
      let temp = this.trim(tempArr[i]);
      // 后缀表达式合成处理
      if (temp) {
        // 假如是运算符号
        if (ReversedPolishNotationUtils.isOperator(temp)) {
          if (temp === '(') {
            opStack.push(temp);
          } else if (temp === ')') {
            // 遇到右小括号，则寻找与之匹配的左小括号，然后把中间的值全部放入队列中
            while (opStack[opStack.length - 1] !== '(' && (opStack.length)) {
                if (opStack.length === 1) {
                    throw Error('公式错误，无法匹配到左括号')
                }
              rpnRes.push(opStack.pop());
            }
            // 上述循环停止，这栈顶元素必为"(", 并且出栈
            opStack.pop();
          } else {
            // 栈是空的，则直接入栈
            if (!opStack.length) {
              opStack.push(temp);
              continue;
            }

            // 上一个元素不为(，且当前运算符优先级小于上一个元素, 则将比这个运算符优先级大的元素全部加入到临时队列中
            while (opStack.length && opStack[opStack.length - 1] !== '(' && !super.comparePriority(temp, opStack[opStack.length - 1])) {
              rpnRes.push(opStack.pop());
            }
            opStack.push(temp);
          }
        } else {
          if (isNaN(temp)) {
            throw Error('表达式不合法');
          } else {
            // 数字：将string转为number, 方便后续的计算处理
            rpnRes.push(Number(temp));
          }
        }
      }
    }
    // 将栈中剩余元素加入到队列中
    while (opStack.length) {
      rpnRes.push(opStack.pop());
    }
    return rpnRes;
  }

  /**
   * 首尾去空格
   * @param str
   * @return str
   */
  trim (str) {
    return str.replace(/^\s*(.*?)\s*$/, '$1');
  }

  /**
   * 判断是否是运算符
   * @param str 
   * @return boolean
   */
  static isOperator (str) {
    return ['+', '-', '*', '/', '(', ')'].includes(str);
  }
}
