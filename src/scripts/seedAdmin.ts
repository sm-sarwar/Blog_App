import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
    try {

       

        const adminData = {
            name: "admin shaheb",
            email: "admin@gmail.com",
            role: UserRole.USER,
            password: "admin123"
        }

       

        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        })
        
        if (existingUser) {
            throw new Error(`Admin user with email ${adminData.email} already exists.`)
        }
        
        const signUpAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(adminData)
        })
        
        if (signUpAdmin.ok) {
            
            prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
            
        }
        console.log(signUpAdmin)


    } catch (err) {
        console.error('Error seeding admin user:', err);
    }
}
seedAdmin()