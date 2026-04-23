## About Me

<div style="text-align: center;">
    <h1 style="color: #00D9FF;">Hello, I'm Mirkashi!</h1>
    <p style="font-size: 18px;">I'm a passionate software developer.</p>
    <p class="typing" style="font-size: 20px;"><span id="typing">  </span></p>
    <script>
        const text = "I love coding, exploring new technologies, and creating innovative solutions.",
              speed = 100;
        let index = 0;
        function type() {
            if (index < text.length) {
                document.getElementById("typing").innerHTML += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        }
        type();
    </script>
</div>

<table style="width: 100%;">
    <tr>
        <td style="width: 50%;"><strong>What I do:</strong>
            <ul>
                <li>Full Stack Development</li>
                <li>Data Science</li>
            </ul>
        </td>
        <td style="width: 50%;"><strong>What I’m exploring:</strong>
            <ul>
                <li>Machine Learning</li>
                <li>Cloud Computing</li>
            </ul>
        </td>
    </tr>
</table>

<div style="margin: 20px 0;">
    <strong>Quick Facts:</strong>
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="border: 1px solid #00D9FF; padding: 10px;">Location: Virtual</td>
            <td style="border: 1px solid #00D9FF; padding: 10px;">Hobbies: Coding, Reading</td>
        </tr>
    </table>
</div>

<details>
    <summary style="cursor: pointer;">Fun Facts</summary>
    <p>I once participated in a hackathon and developed a game in under 24 hours!</p>
    <p>I love learning new programming languages.</p>
</details>

<div style="overflow: hidden;">
    <svg width="100%" height="50" preserveAspectRatio="none">
        <path d="M0,0 C100,100 200,-100 300,0 L300,50 L0,50 Z" style="fill: #00D9FF; animation: wave 5s infinite;"/>
    </svg>
    <style>
        @keyframes wave {
            0% { transform: translateX(0); }
            50% { transform: translateX(-20px); }
            100% { transform: translateX(0); }
        }
    </style>
</div>

---

