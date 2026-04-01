package main

import (
	"encoding/json"
	"net/http"
	"os"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Profile 个人信息
type Profile struct {
	Name   string `json:"name"`
	Title  string `json:"title"`
	Bio    string `json:"bio"`
	Avatar string `json:"avatar"`
}

// Skill 技能
type Skill struct {
	Name     string `json:"name"`
	Level    int    `json:"level"`
	Category string `json:"category"`
}

// Contact 联系方式
type Contact struct {
	Email    string `json:"email"`
	Github   string `json:"github"`
	LinkedIn string `json:"linkedin"`
	Twitter  string `json:"twitter"`
}

// Data 数据存储
type Data struct {
	Profile Profile `json:"profile"`
	Skills  []Skill `json:"skills"`
	Contact Contact `json:"contact"`
}

var (
	data     Data
	dataFile = "data/data.json"
	mu       sync.RWMutex
)

func main() {
	// 加载数据
	loadData()

	// 创建 Gin 路由
	r := gin.Default()

	// 配置 CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "PUT", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// API 路由
	api := r.Group("/api")
	{
		// 个人信息
		api.GET("/profile", getProfile)
		api.PUT("/profile", updateProfile)

		// 技能
		api.GET("/skills", getSkills)
		api.PUT("/skills", updateSkills)

		// 联系方式
		api.GET("/contacts", getContacts)
		api.PUT("/contacts", updateContacts)
	}

	// 启动服务
	r.Run(":8080")
}

// loadData 从文件加载数据
func loadData() {
	file, err := os.ReadFile(dataFile)
	if err != nil {
		// 初始化默认数据
		data = Data{
			Profile: Profile{
				Name:   "张三",
				Title:  "全栈开发工程师",
				Bio:    "热爱编程，专注于 Web 开发和技术分享。拥有5年开发经验，擅长 React、Go、TypeScript 等技术栈。",
				Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
			},
			Skills: []Skill{
				{Name: "React", Level: 90, Category: "前端"},
				{Name: "TypeScript", Level: 85, Category: "前端"},
				{Name: "Golang", Level: 80, Category: "后端"},
				{Name: "Node.js", Level: 75, Category: "后端"},
				{Name: "PostgreSQL", Level: 70, Category: "数据库"},
				{Name: "Docker", Level: 65, Category: "DevOps"},
			},
			Contact: Contact{
				Email:    "zhangsan@example.com",
				Github:   "https://github.com/zhangsan",
				LinkedIn: "https://linkedin.com/in/zhangsan",
				Twitter:  "https://twitter.com/zhangsan",
			},
		}
		saveData()
		return
	}
	json.Unmarshal(file, &data)
}

// saveData 保存数据到文件
func saveData() error {
	file, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(dataFile, file, 0644)
}

// getProfile 获取个人信息
func getProfile(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()
	c.JSON(http.StatusOK, data.Profile)
}

// updateProfile 更新个人信息
func updateProfile(c *gin.Context) {
	var profile Profile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mu.Lock()
	data.Profile = profile
	err := saveData()
	mu.Unlock()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated", "data": profile})
}

// getSkills 获取技能列表
func getSkills(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()
	c.JSON(http.StatusOK, data.Skills)
}

// updateSkills 更新技能列表
func updateSkills(c *gin.Context) {
	var skills []Skill
	if err := c.ShouldBindJSON(&skills); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mu.Lock()
	data.Skills = skills
	err := saveData()
	mu.Unlock()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Skills updated", "data": skills})
}

// getContacts 获取联系方式
func getContacts(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()
	c.JSON(http.StatusOK, data.Contact)
}

// updateContacts 更新联系方式
func updateContacts(c *gin.Context) {
	var contact Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mu.Lock()
	data.Contact = contact
	err := saveData()
	mu.Unlock()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Contact updated", "data": contact})
}
