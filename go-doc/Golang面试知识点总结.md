# Golang 面试知识总结

> 本文档汇总了 Golang 开发岗位面试中常问的知识点，涵盖语言基础、并发编程、内存管理、标准库、框架与工具等核心领域。

## 目录

1. [语言基础](#1-语言基础)
2. [数据类型与语法](#2-数据类型与语法)
3. [函数与接口](#3-函数与接口)
4. [并发编程](#4-并发编程)
5. [内存管理](#5-内存管理)
6. [标准库](#6-标准库)
7. [Go 进阶](#7-go-进阶)
8. [工程实践](#8-工程实践)

---

## 1. 语言基础

### 1.1 Go 的特性

| 特性 | 说明 |
|-----|------|
| **静态类型** | 编译时确定类型，编译后类型信息丢失 |
| **强类型** | 不同类型之间需要显式转换 |
| **编译型** | 编译成机器码，执行效率高 |
| **并发原生** | 内置 goroutine 和 channel |
| **垃圾回收** | 内置 GC，无需手动管理内存 |
| **跨平台** | 支持多平台编译 |
| **简单简洁** | 语法简洁，关键字少（25个） |

### 1.2 Go 关键字

```go
break        case         chan         const        continue
default      defer        else         fallthrough  for
func         go           goto         if           import
interface    map          package      range        return
select       struct       switch       type         var
```

### 1.3 GMP 调度模型

Go 的运行时调度器采用 GMP 模型：

- **G (Goroutine)**: 轻量级协程，栈空间 2KB起步
- **M (Machine)**: 操作系统线程
- **P (Processor)**: 处理器，执行 G 的上下文

```
                    ┌─────────────────────────────────────┐
                    │                  M                   │
                    │  ┌─────────────────────────────────┐ │
                    │  │           全局队列 (GRQ)          │ │
                    │  └─────────────────────────────────┘ │
                    └─────────────────────────────────────┘
                                    ▲
                                    │ steal
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│      P        │         │      P        │         │      P        │
│ ┌───────────┐ │         │ ┌───────────┐ │         │ ┌───────────┐ │
│ │  本地队列   │ │         │ │  本地队列   │ │         │ │  本地队列   │ │
│ │ G1 G2 G3   │ │         │ │ G4 G5 G6   │ │         │ │ G7 G8 G9   │ │
│ └───────────┘ │         │ └───────────┘ │         │ └───────────┘ │
│ ┌───────────┐ │         └───────────────┘         └───────────────┘
│ │  runnext  │ │
│ └───────────┘ │
└───────────────┘
```

**调度流程**：
1. `P` 从本地队列获取 `G` 执行
2. 本地队列为空时，从全局队列或别的 `P` 偷取
3. `G` 阻塞时，`M` 会从 `P` 解绑，继续执行其他 `G`
4. `G` 完成后，通过 `channel` 或 `sync` 通知

### 1.4 make vs new

| 函数 | 适用类型 | 返回值 | 用途 |
|-----|---------|-------|------|
| `new(T)` | 任意类型 | `*T` (指针) | 分配内存并置零，用于值类型 |
| `make(T)` | slice/map/channel | `T` (本身) | 初始化 slice/map/channel 的内部结构 |

```go
// new: 返回指向零值的指针
a := new(int)      // *int, a == nil? false, *a == 0
fmt.Println(*a)    // 0

// make: 返回初始化的切片/映射/通道
s := make([]int, 0)    // []int{}/[]int
m := make(map[string]int)  // map[string]int{}
ch := make(chan int, 10)   // chan int
```

---

## 2. 数据类型与语法

### 2.1 基本数据类型

| 类型 | 长度 | 说明 |
|-----|------|------|
| `bool` | 1 byte | true/false |
| `byte` | 1 byte | uint8 的别名 |
| `rune` | 4 byte | int32 的别名，表示 Unicode |
| `int/uint` | 平台相关 | 32位或64位 |
| `int8/uint8` | 1 byte | -128~127 / 0~255 |
| `int16/uint16` | 2 byte | -32768~32767 / 0~65535 |
| `int32/uint32` | 4 byte | -21亿~21亿 / 0~42亿 |
| `int64/uint64` | 8 byte | 大范围整数 |
| `float32/float64` | 4/8 byte | IEEE-754 单/双精度 |
| `complex64/complex128` | 8/16 byte | 复数 |
| `string` | 不可变字节序列 | UTF-8 编码 |

### 2.2 零值

| 类型 | 零值 |
|-----|------|
| 数值类型 | 0 |
| bool | false |
| string | "" |
| slice/chan/map/pointer/interface/func | nil |

### 2.3 数组 vs 切片

```go
// 数组: 固定长度，值类型
arr := [3]int{1, 2, 3}      // 长度固定为3
arr2 := [...]int{1, 2, 3}  // 长度由初始化元素决定

// 切片: 动态数组，指针+长度+容量，引用类型
slice := []int{1, 2, 3}
slice2 := make([]int, 3)     // len=3, cap=3, 元素为0
slice3 := make([]int, 0, 10) // len=0, cap=10

// 切片的底层结构
type slice struct {
    array unsafe.Pointer  // 指向底层数组的指针
    len   int             // 长度
    cap   int             // 容量
}
```

### 2.4 Map

```go
// 创建
m := make(map[string]int)          // 空的map
m2 := map[string]int{"a": 1}       // 初始化

// 操作
m["key"] = 1                       // 插入/更新
v, ok := m["key"]                   // 读取，ok表示是否存在
delete(m, "key")                    // 删除，不存在时无操作

// 并发不安全
// 并发读写需要使用 sync.RWMutex 或 sync.Map
var mu sync.RWMutex
mu.Lock()
m["key"] = 1
mu.Unlock()
```

### 2.5 字符串

```go
s := "hello world"

// 长度: 字节长度，非字符数
len(s)  // 11

// 访问字节
s[0]    // 'h' (byte)

// 切片: 获取子串（substr），返回新字符串
s[0:5]  // "hello"

// 遍历
for i, r := range s {
    fmt.Printf("%c\n", r)  // 字符，非字节
}

// 常用操作
strings.Split(s, " ")     // ["hello", "world"]
strings.Join([]string{}, "-")
strings.Contains(s, "hello")
strings.TrimSpace("  hi  ")
```

---

## 3. 函数与接口

### 3.1 函数类型

```go
// 命名返回值
func add(a, b int) (c int) {
    c = a + b
    return  // named return，可以省略返回值
}

// 多返回值
func div(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// 变长参数
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
sum(1, 2, 3, 4, 5)

// 函数作为值/参数
type Handler func(int) int
func transform(n int, f Handler) int {
    return f(n)
}
```

### 3.2 闭包

```go
// 闭包: 引用外部变量的函数
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

c := counter()
c()  // 1
c()  // 2
c()  // 3

// 闭包引用循环变量
func main() {
    var funcs []func()
    for i := 0; i < 3; i++ {
        funcs = append(funcs, func() {
            fmt.Println(i)  // 输出: 0 1 2
        })
    }
    for _, f := range funcs {
        f()
    }
}
```

### 3.3 接口

```go
// 接口定义
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// 接口组合
type ReadWriter interface {
    Reader
    Writer
}

// 空接口: 可以存储任意值
var i interface{} = 1
var i interface{} = "hello"
var i interface{} = struct{}{}

// 类型断言
var i interface{} = "hello"
s, ok := i.(string)      // 安全断言
s := i.(string)          // 不安全，panic

// 类型判断
switch v := i.(type) {
case string:
    fmt.Println("string:", v)
case int:
    fmt.Println("int:", v)
}
```

### 3.4 接口的内部结构

```go
// 接口的内部结构 (iface)
type iface struct {
    tab  *itab           // 接口类型和实际类型的元数据
    data unsafe.Pointer  // 指向实际值的指针
}

// itab 结构
type itab struct {
    inter *interfacetype // 接口类型
    _type *_type         // 实际类型
    hash  int32          // 类型哈希
    fun   [1]uintptr     // 方法指针数组
}

// 空接口的内部结构 (eface)
type eface struct {
    _type *_type    // 类型指针
    data  unsafe.Pointer  // 值指针
}
```

---

## 4. 并发编程

### 4.1 Goroutine

```go
// 启动协程
go func() {
    fmt.Println("Hello from goroutine")
}()

// 带返回值的 goroutine
result := make(chan int)
go func() {
    // 计算
    result <- 42
}()
value := <-result
```

### 4.2 Channel

```go
// 创建
ch := make(chan int)           // 无缓冲
ch := make(chan int, 10)        // 有缓冲，容量10

// 操作
ch <- value   // 发送
value := <-ch // 接收
<-ch          // 丢弃接收值
close(ch)    // 关闭
v, ok := <-ch // ok=false表示通道已关闭

// 方向声明
func producer(ch chan<- int) {}  // 只能发送
func consumer(ch <-chan int) {}  // 只能接收
```

### 4.3 Select

```go
select {
case v := <-ch1:
    fmt.Println(v)
case v := <-ch2:
    fmt.Println(v)
case <-time.After(time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("no data")
}

// 遍历 channel
for v := range ch {
    fmt.Println(v)
}
```

### 4.4 并发安全

```go
// 1. Mutex
var counter int
var mu sync.Mutex

for i := 0; i < 1000; i++ {
    go func() {
        mu.Lock()
        counter++
        mu.Unlock()
    }()
}

// 2. RWMutex (读多写少场景)
var (
    mu   sync.RWMutex
    data map[string]int
)

func read(key string) int {
    mu.RLock()
    defer mu.RUnlock()
    return data[key]
}

func write(key string, value int) {
    mu.Lock()
    defer mu.Unlock()
    data[key] = value
}

// 3. atomic
var counter atomic.Int64

for i := 0; i < 1000; i++ {
    go func() {
        counter.Add(1)
    }()
}
counter.Load()

// 4. Once
var once sync.Once
once.Do(func() {
    fmt.Println("只执行一次")
})

// 5. WaitGroup
var wg sync.WaitGroup

for i := 0; i < 10; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        fmt.Println("done")
    }()
}
wg.Wait()
```

### 4.5 Context

```go
// 创建
ctx := context.Background()              // 根context
ctx, cancel := context.WithCancel(ctx)   // 可取消
ctx, cancel := context.WithTimeout(ctx, time.Second*5)  // 超时取消
ctx, cancel := context.WithValue(ctx, "key", "value")   // 带值

// 使用
select {
case <-ctx.Done():
    err := ctx.Err()
    fmt.Println(err)  // context.Canceled 或 context.DeadlineExceeded
}

// 传递请求作用域的值
ctx = context.WithValue(ctx, "trace-id", "123")
traceID := ctx.Value("trace-id")
```

---

## 5. 内存管理

### 5.1 内存布局

```
高地址
┌──────────────┐
│   Stack      │  向下增长，局部变量，函数参数
├──────────────┤
│   ......     │
├──────────────┤
│   Heap       │  向上增长，动态分配
└──────────────┘
低地址
```

### 5.2 逃逸分析

编译器通过逃逸分析决定变量分配在栈还是堆：

```go
// 逃逸到堆的情况

// 1. 返回局部变量的指针
func foo() *int {
    a := 10
    return &a  // 逃逸，堆上分配
}

// 2. 发送指针或引用到 channel
ch := make(chan *int)
ch <- &a  // 逃逸

// 3. 切片增长超过容量
s := make([]int, 1, 1)
s = append(s, 1)  // 可能逃逸

// 4. map/slice 存储指针
m := make(map[string]*int)
m["key"] = &a  // 逃逸

// 不逃逸的情况
a := 10        // 栈上分配
b := foo()     // 直接返回 int，不逃逸
```

### 5.3 垃圾回收 (GC)

Go 使用并发三色标记清扫回收器：

1. **标记阶段**: STW (Stop The World) 标记根对象
2. **并发标记**: 与用户代码并发执行
3. **标记完成**: STW 重新扫描
4. **清扫阶段**: 并发清扫未使用的对象

**GC 触发时机**：
- 堆内存达到阈值 (GOGC 环境变量，默认 100%)
- 定期触发 (2分钟)
- 手动调用 `runtime.GC()`

### 5.4 内存分配

Go 的内存分配器采用多级缓存：

- **mcache**: 每 P 的缓存，存 67 个 sizeclass
- **mcentral**: 全局中心缓存，按 sizeclass 分类
- **mheap**: 全局堆，管理大对象

```go
// 小对象分配: mcache → mcentral → mheap
// 大对象分配: 直接从 mheap 分配
```

---

## 6. 标准库

### 6.1 fmt

```go
// 格式化输出
fmt.Println("hello")                    // 换行输出
fmt.Printf("value: %d\n", 42)          // 格式化输出
fmt.Sprintf("name: %s, age: %d", "Tom", 20) // 返回字符串

// 动词
%d    // 十进制整数
%x    // 十六进制
%f    // 浮点数
%t    // 布尔
%s    // 字符串
%p    // 指针
%v    // 任意值
%#v   // Go 语法表示

// 结构体输出
fmt.Printf("%+v\n", person)  // 带字段名
fmt.Printf("%#v\n", person)   // Go 语法
```

### 6.2 strings

```go
// 常用函数
strings.Split(s, sep)           // 分割
strings.Join([]string{}, sep)   // 拼接
strings.Contains(s, substr)     // 包含
strings.HasPrefix(s, prefix)    // 前缀
strings.HasSuffix(s, suffix)    // 后缀
strings.Index(s, substr)       // 索引
strings.ToLower(s)             // 转小写
strings.ToUpper(s)             // 转大写
strings.TrimSpace(s)           // 去除首尾空白
strings.Replace(s, old, new, n) // 替换，n=-1 全部

// Builder (高效拼接)
var sb strings.Builder
sb.WriteString("hello")
sb.WriteString(" world")
sb.WriteByte('!')
fmt.Println(sb.String())
```

### 6.3 json

```go
import "encoding/json"

// 序列化
type Person struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

p := Person{Name: "Tom", Age: 20}
data, _ := json.Marshal(p)       // []byte
data, _ := json.MarshalIndent(p, "", "  ") // 格式化

// 反序列化
json.Unmarshal(data, &p)

// 动态解析
var m map[string]interface{}
json.Unmarshal(data, &m)

// 标签
`json:"name"`           // 序列化/反序列化
`json:"name,omitempty"` // 空值忽略
`json:"-"`              // 忽略字段
`json:",string"`        // 转字符串
```

### 6.4 time

```go
// 获取当前时间
now := time.Now()

// 时间操作
now.Add(time.Hour * 24)           // 加
now.Sub(other)                    // 减
now.Before(other)                // 比较
now.Equal(other)                 // 相等

// 格式化
now.Format("2006-01-02 15:04:05") // 特别注意: 必须是这个时间

// 解析
t, _ := time.Parse("2006-01-02", "2024-01-01")

// 定时器
tick := time.Tick(time.Second)
select {
case <-tick:
    // 每秒执行
}

// 睡眠
time.Sleep(time.Second)
```

### 6.5 error

```go
// 创建错误
errors.New("error message")
fmt.Errorf("failed: %w", err)  // 包装错误

// 判断错误类型
errors.Is(err, ErrNotFound)  // 链式判断
errors.As(err, &myErr)       // 类型断言

// 自定义错误类型
type MyError struct {
    Code    int
    Message string
}

func (e *MyError) Error() string {
    return fmt.Sprintf("code=%d, msg=%s", e.Code, e.Message)
}
```

---

## 7. Go 进阶

### 7.1 reflect

```go
import "reflect"

// 获取类型和值
v := reflect.ValueOf(x)
t := reflect.TypeOf(x)

// 类型推断
if t.Kind() == reflect.Slice {
    // ...
}

// 设置值 (需要指针)
v := reflect.ValueOf(&x).Elem()
v.SetInt(100)

// 调用方法
method := v.MethodByName("MethodName")
method.Call(nil)

// 动态创建结构体
t := reflect.StructOf([]reflect.StructField{
    {Name: "Name", Type: reflect.TypeOf("")},
})
```

### 7.2 unsafe

```go
import "unsafe"

// 指针转换
i := 10
p := (*int)(unsafe.Pointer(&i))

// 查看结构体字段偏移量
type Person struct {
    A int8   // 0
    B int    // 8
    C int8   // 16
}
fmt.Println(unsafe.Offsetof(Person{}.B))  // 8

// 节省内存
var b byte = 1
var a struct {
    x bool   // 1 byte
    _ [7]byte
    y int    // 8 bytes
}
```

### 7.3 CGO

```go
/*
#include <stdio.h>
void say() {
    printf("Hello from C\n");
}
*/
import "C"

func main() {
    C.say()
}
```

### 7.4 泛型 (Go 1.18+)

```go
// 类型参数
func Sum[T int | float64](nums []T) T {
    var sum T
    for _, n := range nums {
        sum += n
    }
    return sum
}
Sum([]int{1, 2, 3})
Sum([]float64{1.1, 2.2})

// 泛型类型约束
type Number interface {
    int | int32 | int64 | float32 | float64
}

// 泛型结构体
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}
```

---

## 8. 工程实践

### 8.1 错误处理模式

```go
// 1. 错误包装
if err != nil {
    return fmt.Errorf("doSomething failed: %w", err)
}

// 2. Sentinel 错误
var (
    ErrNotFound = errors.New("not found")
    ErrInvalid  = errors.New("invalid input")
)

// 3. 错误类型
type MyError struct {
    Code int
    Err  error
}

func (e *MyError) Error() string {
    return fmt.Sprintf("code=%d: %v", e.Code, e.Err)
}

func (e *MyError) Unwrap() error {
    return e.Err
}
```

### 8.2 依赖注入

```go
// 接口定义
type UserRepository interface {
    FindByID(ctx context.Context, id int64) (*User, error)
}

// 实现
type MySQLUserRepository struct{}

func (r *MySQLUserRepository) FindByID(ctx context.Context, id int64) (*User, error) {
    // ...
}

// 服务使用
type UserService struct {
    repo UserRepository  // 依赖接口，不依赖实现
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}
```

### 8.3 配置管理

```go
// Viper
import "github.com/spf13/viper"

viper.SetConfigName("config")
viper.SetConfigType("yaml")
viper.AddConfigPath(".")
viper.AutomaticEnv()

viper.Unmarshal(&cfg)

// 环境变量
// config.yaml -> CONFIG_
// myKey -> MY_KEY
```

### 8.4 日志

```go
// 标准库
log.Printf("info: %s", msg)
log.Fatalf("fatal: %v", err)

// Zap
logger, _ := zap.NewProduction()
defer logger.Sync()
logger.Sugar().Infow("info",
    "key", "value",
)
```

---

## 常见面试题

### Q1: Go 有哪些优于其他语言的特点？

**答案**：
- 语法简洁，学习曲线低
- 编译速度快
- 静态类型 + 编译时类型检查
- 原生并发支持 (goroutine + channel)
- 强大的标准库
- 垃圾回收
- 跨平台编译

### Q2: GMP 调度模型的原理？

**答案**：
- G (Goroutine) 是轻量级执行单元
- M (Machine) 是 OS 线程
- P (Processor) 是 G 的执行上下文
- 调度器从本地队列获取 G 到 P 上执行
- 本地队列为空时，从全局队列或其他 P 偷取
- G 阻塞时，M 会解绑 P，继续执行其他 G

### Q3: Channel 有哪些状态？

**答案**：
| 操作 | nil channel | 有效 channel (缓冲未满/有数据) | 已关闭 channel |
|-----|-------------|-------------------------------|---------------|
| 发送 | 永久阻塞 | 成功/阻塞 | panic |
| 接收 | 永久阻塞 | 成功/阻塞 | 返回零值和 false |
| 关闭 | panic | 成功 | panic |

### Q4: make 和 new 的区别？

**答案**：
- `new(T)`: 分配任意类型的内存，返回 `*T`，用于值类型
- `make(T)`: 只能创建 slice/map/channel，返回 `T` 本身，用于引用类型

### Q5: 如何避免内存逃逸？

**答案**：
- 尽量使用值类型而非指针
- 避免返回局部变量的指针
- 避免在 slice/map 中存储指针
- 使用 sync.Pool 复用大对象
- 使用小数组替代大结构体

### Q6: 什么是 goroutine 泄露？

**答案**：
Goroutine 意外永久阻塞，无法被 GC 回收：
- channel 无发送无接收
- 死锁
- 无限循环
**排查**：使用 `runtime.NumGoroutine()` 监控

### Q7: Go 的 GC 是如何工作的？

**答案**：
- 三色标记清扫回收器
- 初始 STW 标记根对象
- 并发标记
- 重新扫描 STW
- 并发清扫
- 触发条件：堆内存达到阈值或定时触发

### Q8: 如何实现一个线程安全的计数器？

```go
// 方案1: atomic
var counter atomic.Int64

func inc() {
    counter.Add(1)
}

// 方案2: Mutex
var (
    counter int
    mu      sync.Mutex
)

func inc() {
    mu.Lock()
    counter++
    mu.Unlock()
}

// 方案3: Once (仅初始化一次)
var once sync.Once
```

---

## 参考资料

- [Go 官方文档](https://go.dev/doc/)
- [Go 语言设计与实现](https://draveness.me/golang/)
- [Go 高级编程](https://chai2010.cn/advanced-go-programming-book/)
