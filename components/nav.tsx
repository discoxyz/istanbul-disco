"use client";

import Link from "next/link";
import { FC } from "react";
import { Button2 } from "./button";
import { useAuth } from "../contexts/authProvider";
import { Spinner } from "./spinner";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const Nav: FC = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { authenticate, authenticated, logout, loading } = useAuth();
  return (
    <nav className="mb-6 flex w-full flex-wrap items-center justify-between py-0 text-lg">
      <Link href="/">
        <Image
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA4qSURBVHgBxVsLcFTXef7P495dIcl6ISwZCRDY1hBcbGxqOzi8nMQJ49ppG0/itDOhLWEmeFw70+dM2gactqkzmY4noU4T9+166qnTusmkdeyAeZnBpGAIYCABggSSQA/Q+7F773nkO+dKDslMluVKLN/Mzt3V7j33fPf/z//4zhWjEqK37fTnrOCPMRneoyxjlvgPtDb/Mm9e079SicCoROg9fvKrlOVPGcGJRECWSwJhzECQ5MGfz2mo/WsqAUpCuOfgsUUsFGdshpEWuGgQEqxMDKS1IeJcjIYZ2VRbWztE1xmcSoAoZ1tJWSJjiFnYlbk7DabWkMAHa0zF2Fg8n0qAkhCuKK/cB36j3DKSQnqiBOKMGZDHDRDU3tQ05wSVACUhXLOsZVBY9jmjTJ6UJgZLWx17Sxuj+vH504wxRSVAyYKWQ/fRUwuZjP6AZfidFATwZ/n2WETPtrS0DFKJUBRha618t+fIxwM5a3VkrNEi+M6yuoXb6Abi0qXhj2lND8NHhqw1exoaar9bzHlXJXz2wqH5QUZ8O7byrkiDPFJKHs6nGf/sPTff+k26AejqGnhGSvaFqc9Wu+zGvh9F9Knm5qr+QudedQ1XltF2ZtVdwioKEGSYiinkCDTWPLFly5aSxIArMTw8XBdK/uTUZ3gf2FrEAvOQlPalq51fcMK9vXs/yXR0q0SIlYisIQYO3AslQ4azOevXrw+pxMjlbI0hUys49+4phECUx3vmnXVdf//EBwqdX5AwSK2GdWFRToJpkrCwty5pEqRPItjkqMTI54e7QO4sLOrSOhlYWGu31kAGpPP5/AOFzi9I2BobCPcTHTmCeCGwYsFIo/DK/wPdADQ3N08oZb/m3jM3e2NpytoOqNoKep0s9KVW8X/LIPyMG9d5jIWFsVpwlF+cf/NdL1/52/29HbdNqPBeZeBjMTv14Za6/ZQSWJe8t7f3/Ti2kpaXc7E6umBBQ9vU97fcUvPVrq5LrVLKTRYzcsuYg7QGeantK4XGvmqUHrq070lGbJNl/BajzRHLxN/W1t/7Xgo42X3yV/IUfC1nwzWKZSinBCm8dJ4fpDHz2MN315yja8BwX+ftMYlXtWFLrIHlUIYxZ0rGvqXUxJ80Nja2T/324sWB38F3m1DAtOJ4LorjZ+fOrX2ZpkPYwe7cIgcXrK6oaVn7cwXCme4jd3AWbhuzsiHPshQhnE2ArDEBxRMYPOInRqqGln8CbljMdfq7uuYpyu0SQbYFRnYLCAEJXZVBvW19Ad4eGnqwuqG67crzOjqGant6To8sX748vto1Uldavb3v3Mpkdse44mAT0DhIRiyknJEUx87K8Is8LKRp/UfuqHqxmDH7O07/qRXiWeZIsgAuiunBwlOWtkmQOoseenVTU10npUDqPIpA8RIZ3cx8V4vA4da4dZETVYn7wFw/5FY8e6DYMZnRH3ZjYVyQU1iXSeTl8FmeDOm6q4VBwJ+jlEhFuL9n/1Jm1H0oMifJOtqYqHvvLaH9ZOGRfqJFT0bbCaa1n9RU++h0keRGan/0V7HskYEBW00pkIqwEHwp98HEegu4iZC3NPOTdJMyiJhwapSi/OQ1DN2WdFLK981k3XGKOHlLuwID183kcoN3UgqkIow7XOEnQUkQ4CzJg8y7net5fVQl6908/nax43JNrzLty1a8krzvSKNu9iWkT42wtAMKjwylQErC0Qlf2rgL+5VqJ+98UvlMqRqY3OfXLa5pL3bcytsW7zK5+J9dz4zyyVvXCQRuPTsXd9VV4kSWysvLz1AKpCJcXb/iLVzzaJIqXGThfhLaWYd73wNxs/Xh1tq/oWtEVVD2BFf0fbeWXfAiCAUCpKXTwphN0gpj36muzp6lFEhFGNa0kGt+E29Ou6Xma1kQ1W79OnMb9ZfrFtQ+RSnAbrstX3Hr4nXM2K940jpRR9y6Ju9J5jBubKqx/fg0DXR0HK/VGfr1cSMeQuGhIitPaM1eXTF37o8Knbfr9eGVnPJnVn20/mKh3/WcPba0LDvrcUi6i4jLccXE28OjN7/Y0sKm37SMjByqHzm/e9UQSNB1xo5tg7v27RxJnUuLRVvbQPX588Mre3tHG6b+5l16sH33V+zg+AWoGbsZGzg+3H3gUbpO2Ll39I9EVqxW1jy9d/vAWrpO6O4e+v1sVnQKbvfEse1A+bnZ/Z0N/+St3yNh/smVcG4dJnFIDOlcZkFNy7IZFdfe3D/2u4jA/0gxnBTBTmh7Gcr8pz/wUPlrNIPobBu4i4f8cJLHXCYhXxOEoXyQM8E32CRhOkF8MuHrKpEd+zOaQbz+ztCTitQ30BNwJrlPZopMHVi/8v87hp6gGQSTtDnJ2SaRgGzSQuZy0QZulfpVzpNgzdzRpVf8GgX6cpoBvHFqZNVrR4e2I75u5ZKHBqkFKkKSv11k57YcG2vPH9g++D+Hto+8j2YAsN9S11JOFSu+Qktqofvd29i6DR7Lkr7TlYxY2tCKZkSgU7Ea5kL04K5DM7FOXfRHHkIp80uIQS8wNtK8T6nRGdHJ0WBIR1YieSe192QVKPg4tDlzEJ9XWVcegrgTxTQqHdz9H9AM4OElNT/E4bf/953LuzNB5rl4Qs2aqr8FSkbUFhfg5Y8/8JGb3qIZAoqeQzjMky4uUWJlV9vjddw1Xi87e09VMb5MFHwwQ/rvaAbxa/fUvYD7vp4CPoGAgrTqA+R52PqRNWtmjqwD1+ZLMBwEGjPZ3Dhr45qB/A9eefuqbzASX+Zc+vULiw+gQlxfNnfleZphfGhJ5X8RN087l45dy5fVH//gqvJDNMNonDf7gFLqDxGb4sm1PIql9fmmhvLvvrdmxjv3NymVa9bWnvxFKWem8b0fDuxglv3ko8uqN9J1RHt7X2MQZBZF0eV3p/avphUk2traqkcrog15E94dYZfbWHECee7fV8yZU7CT+d6xgTXxODv36H0/r039InrfOb8yyKiHeFYttKEgOatyW3ld/UvT2WlMTbjt4uEFeWZ3xSI7P29DyhvXvYYUabfBzTZ/qLnxi5QSp1+zGVnZu7U8zG8MyiLi5VhqIGwklp3IHDacPzJ79uwuSoH0mpZQb4ZCzHd9q6MauHwHxS5E2hGSP7PrYt/fUwqcPm0z4xVDbyhDG43lkzoKn+yxfXRfhmj3b5QSqQj39R1YgyC7MECh4gm6vSfmtC0nxSRbMogVn915sW/zNQ5NXReHnlPY4lEYwO1SWniO2x10/bbLYZOSzwcvX77cTCmQzsI6uh3WhcoYQ6BNNtm4jbHhBrJkvKW5n6X6whvt7S3FDrv70MgqUSY2Rbhhzn01qpUoTxTnXdNNflvFq6TWyzxLKAVSCgD5nJNdnEWl329SlOVuR9GRx7YqOSsrZ3VeUV7+G8WOGwvzydjlxkDSBFw4b6Fv4wo65k74IBuDqFLetSEOjFIKSEoBZmYd5CIpzL2yBdeO4G6ocEh56VZijbv61RftRdfHNqBW1NsU5dwYgiJlKacxRXiMgBjvLewuqPKmprH5XUqBVBaua7z/BFxrF/fByu0Xx5TBpGaBZAWquVnCxeuYsvg+63WaIhGyMS1xI7OorwNYHJE5h/JQYRsnn0MZGiEy4iZwZV5EakpVK6SO0pKJJ7Eh0i382kXAspEnHsIJQ/wtA5fP4DOLc3uLHZNxfRA7LGQC1L0Z7PUiMsZhANISlkbqi1Dn51g7NK1nKCWKImyPvxL292+ruvJvlXX3HleMPQijnhdYryHWc+A2z71lsaYFCNvo6EBj58tUJGYF/Hke6A6RhRVnwaI4qgynMRg2kiCsg7aIwrU1LS3t780NzbxFAWR9Uz8DhAfO7XpquLrxlMxl20Z69u0d7dv3qanvZs9+/0mrxBq0t2+5YCBBFPPz5IWJ9mYz9OhatrboqmhFc1W/Mvk16BzbeQDXDlFzw9pxBnE5FK8PTOi1jYt/tl06eKZjY3/bubcHBW8fuNB1GLuPj1/tGgXvyuC5PY9BFv0Wl+5B0KSJdpJsJsw8U1Z/35Yrf4vc3CqNWYxioRaOfLyhYfm02ss9HX2rGQvnmZyKjMjsXttS0X3l953Her4ueLxJIl5wqf0+lggDwzLi/qrZjQcoDeHhtj0vIPdsdPqEi8T+wRE+ucNg2LqqW1a8TjcAJ471b4Ie9vXAxQmJxCVQkEC9D7LuSV36i5p5C/7ql51b0KV94nFKCIIG8820A/PbKSIQf0w3AAcP2mAsEE+PQZBBY+2DWS5CrlYIl1Cr9UThrFCQsGSQbclpeto/CfveScxtibL3WbszS6VG3cginWGtMUSEccx+AnPJoXnJYRM+BnFO2YJiQkHC5fPzr2AD6whjic6VqJt+9xBlre1mbG3JH1tCGrjEAjUQw401XHhCOuLCP4EwoYJXa1vnFkyDBQmDkLJWfAw/O+2jgrdysl2NKmor3QAsn3vTpTCwXwpd2spgA6+MuygO0uzNXD66qqBQdD880vn2J7B2VzIhQ4hh/1nddN8OuoE42N33W0qJ1UaLCZ63/3f/7dVFPexa0seH7fCPZw+OjG0WgbzbKsR5GewRrPL58vp5F6hEKBnh4e4jGxAPtiLal7mmw4n/TvjH+x5M47Gb5iwpugSdDkpC+HLnkSaopqcQ+MqYf2IueVzCa+H+8SvbNxzVzG8u8nmu6aA0j/9adQfk0jLD3JMByQ4HE0Gy05FE/fqqsoGS/JNHqn74WiGC4JTrnPnkMyDesdzTsFM/MGineflFKgFKYuHqhqVnsWC/6dOZz+nM1+bCif9Id7Dwl2trF133/1lyKGmUHuw68hlImhtAdjksnQftA9roF+rn3ll0Czld/BTdJY4lfp770wAAAABJRU5ErkJggg=="
          height="36"
          width="36"
          alt="gradient disco ball logo"
          className="invert dark:invert-0"
        />
      </Link>
      {loading ? (
        <Spinner
          sizeClassName="h-6 w-6"
          fillClassName="fill-zinc-800 dark:fill-grey-200"
        />
      ) : !authenticated && !isConnected ? (
        <Button2
          onClick={() => openConnectModal && openConnectModal()}
          className="ml-auto"
          variant={"primary"}
        >
          Connect Wallet
        </Button2>
      ) : (
        <Button2
          onClick={authenticated ? () => logout() : () => authenticate()}
          className="ml-auto"
          variant={authenticated ? "primary" : "primary"}
        >
          {authenticated ? "Log out" : "Sign in"}
        </Button2>
      )}
    </nav>
  );
};
