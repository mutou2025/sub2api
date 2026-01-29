import { ProfileInfo } from "@/components/profile/ProfileInfo"
import { ChangePassword } from "@/components/profile/ChangePassword"
import { TOTP } from "@/components/profile/TOTP"

export default function Profile() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <ProfileInfo />
            <div className="grid gap-6 md:grid-cols-2">
                <ChangePassword />
                <TOTP />
            </div>
        </div>
    )
}
