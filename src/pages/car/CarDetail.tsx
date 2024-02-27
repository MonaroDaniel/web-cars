import { useEffect, useState } from "react"
import Container from "../../components/container/Container"
import { CarImageProps } from "../home/Home";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../services/firebaseConnection";
import { doc, getDoc } from "firebase/firestore";
import { FaWhatsapp } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";

interface CarProps {
  id: string;
  name: string;
  model: string;
  city: string;
  year: string;
  km: string;
  description: string;
  created: string;
  price: string | number;
  uid: string;
  whatsapp: string;
  img: Array<CarImageProps>;
}

export default () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState<CarProps>()
  const [sliderPerView, setSliderPerView] = useState<number>(2)

  useEffect(() => {
    async function loadCar() {
      if (!id) { return }

      const docRef = doc(db, 'cars', id)
      getDoc(docRef)
        .then((snapshot) => {

          if (!snapshot.data()) {
            navigate('/', { replace: true })
          }

          setCar({
            id: snapshot.id,
            name: snapshot.data()?.name,
            year: snapshot.data()?.year,
            city: snapshot.data()?.city,
            created: snapshot.data()?.created,
            description: snapshot.data()?.description,
            img: snapshot.data()?.images,
            km: snapshot.data()?.km,
            model: snapshot.data()?.model,
            price: snapshot.data()?.price,
            uid: snapshot.data()?.uid,
            whatsapp: snapshot.data()?.whatsapp,
          })
        })
    }
    loadCar()
  }, [id])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSliderPerView(1)
      } else {
        setSliderPerView(2)
      }
    }
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Container>

      {car && (
        <Swiper
          slidesPerView={sliderPerView}
          pagination={{ clickable: true }}
          navigation
        >
          {car?.img.map(image => (
            <SwiperSlide key={`${image.uid}-${image.name}`}>
              <img
                className="w-full h-96 object-cover"
                src={image.url}
                alt={image.name}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
            <h1 className="font-bold text-3xl text-black">R$ {car?.price}</h1>
          </div>
          <p>{car?.model}</p>

          <div className="flex w-full gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{car?.city}</strong>
              </div>
              <div>
                <p>Ano</p>
                <strong>{car?.year}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p>KM</p>
                <strong>{car?.km}</strong>
              </div>
            </div>
          </div>

          <strong>Descrição:</strong>
          <p className="mb-4 break-words">{car?.description}</p>
          <strong>Telefone / WhatsApp</strong>
          <p>{car?.whatsapp}</p>
          <a
            href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá vi esse ${car?.name} no site WebCarros e fiquei interessado`}
            target="_blank"
            className="bg-green-500 active:bg-green-400 transition-all w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-semibold cursor-pointer"
          >
            Conversar com vendedor
            <FaWhatsapp size={26} color="#FFF" />
          </a>
        </main>
      )}
    </Container>
  )
}