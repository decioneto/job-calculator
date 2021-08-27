const Profile = require('../model/Profile')

module.exports =  {
  index(req, res) {
      return res.render("profile", { profile: Profile.get() })
  },

  update(req, res) {
      const data = req.body

      const weeksPerYear = 52

      const weeksPerMonth = (weeksPerYear - Profile.get()["vacation-per-year"]) / 12

      const weekTotalHours = data["hours-per-day"] * data["days-per-week"]
      
      //total de horas trabalhadas por mês
      const monthlyTotalHours = weekTotalHours * weeksPerMonth

      //valor da hora trabalhada
      const valueHour = data["value-hours"] = data["monthly-budget"] / monthlyTotalHours

      Profile.update({
        ...Profile.get(),
        ...req.body,
        "value-hour": valueHour
      })
      
      return res.redirect('/profile')
  }
}