const express = require("express")
const routes = express.Router()

const Profile = {
    data: {
        name: "Décio Neto",
        avatar: "https://github.com/decioneto.png",
        "monthly-budget": 4000,
        "days-per-week": 5,
        "hours-per-day": 5,
        "vacation-per-year": 4,
        "value-hour": 75,
    },

    constrollers: {
        index(req, res) {
            return res.render("profile", { profile: Profile.data })
        },

        update(req, res) {
            const data = req.body

            const weeksPerYear = 52

            const weeksPerMonth = (weeksPerYear - Profile.data["vacation-per-year"]) / 12

            const weekTotalHours = data["hours-per-day"] * data["days-per-week"]
            
            //total de horas trabalhadas por mês
            const monthlyTotalHours = weekTotalHours * weeksPerMonth

            //valor da hora trabalhada
            const valueHour = data["value-hours"] = data["monthly-budget"] / monthlyTotalHours

            Profile.data = {
                ...Profile.data,
                ...req.body,
                "value-hour": valueHour
            }

            return res.redirect('/profile')
        }
    }
}
    
const Job = {
    data: [
        {
            id: 1,
            name: "Pizzaria Guloso",
            "daily-hours": 2,
            "total-hours": 1,
            "created_at": Date.now(),
            budget: 4500
        },
        {
            id: 2,
            name: "OneTwo Project",
            "daily-hours": 3,
            "total-hours": 47,
            "created_at": Date.now(),
            budget: 4500
        },
    ],
    
    constrollers: {
        index(req, res) {
            const updatedJobs = Job.data.map((job) => {
                const remaining = Job.services.remainingDays(job)
                const status = remaining <= 0 ? 'done' : 'progress'
        
                return {
                    ...job,
                    remaining,
                    status,
                    budget: Job.services.calculateBudget(job, Profile.data["value-hour"])
                }
            })

            return res.render("index", { jobs: updatedJobs })
        },

        create(req, res) {
            return res.render("job")
        },

        save(req, res) {
            const lastId = Job.data[Job.data.length - 1]?.id || 0;

            Job.data.push({
                id: lastId + 1,
                name: req.body.name,
                "daily-hours": req.body["daily-hours"],
                "total-hours": req.body["total-hours"],
                "created_at": Date.now() 
            })

            return res.redirect('/')
        },

        show(req, res) {
            const jobId = req.params.id
            const job = Job.data.find(job => Number(job.id) === Number(jobId))

            if(!job) {
                return res.send('Job not found')
            }

            job.budget = Job.services.calculateBudget(job, Profile.data["value-hour"])

            return res.render("job-edit", { job })
        },

        update(req, res) {
            const jobId = req.params.id
            const job = Job.data.find(job => Number(job.id) === Number(jobId))

            if(!job) {
                return res.send('Job not found')
            }

            const updatedJob = {
                ...job,
                name: req.body.name,
                "total-hours": req.body["total-hours"],
                "daily-hours": req.body["daily-hours"]
            }

            Job.data = Job.data.map(job => {    
                
                if( Number(job.id) === Number(jobId) ) {
                    job = updatedJob
                }

                return job
            })

            return res.redirect('/')
        },

        delete(req, res) {
            const jobId = req.params.id

            Job.data = Job.data.filter(job => Number(job.id) !== Number(jobId))

            return res.redirect('/')
        }
    },

    services: {
        remainingDays(job) {
            const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed()
            const createdDate = new Date(job.created_at)
            const dueDay = createdDate.getDate() + Number(remainingDays)
            const dueDateInMs = createdDate.setDate(dueDay)
        
            const timeDiffInMs = dueDateInMs - Date.now()
        
            //transformar millisegundos em dias
            const dayInMs = 1000 * 60 * 60 * 24
            const dayDiff = Math.floor((timeDiffInMs / dayInMs))
        
            //restam X dias
            return dayDiff
        },

        calculateBudget: (job, valueHour) => valueHour * job["total-hours"]
    }
}

routes.get('/', Job.constrollers.index)
routes.get('/job', Job.constrollers.create)
routes.post('/job', Job.constrollers.save)
routes.get('/job/:id', Job.constrollers.show)
routes.post('/job/:id', Job.constrollers.update)
routes.post('/job/delete/:id', Job.constrollers.delete)
routes.get('/profile', Profile.constrollers.index)
routes.post('/profile', Profile.constrollers.update)

module.exports = routes;