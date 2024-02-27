import { useEffect, useState } from "react"
import Container from "../../components/container/Container"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Link } from "react-router-dom";

export interface CarsProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  img: Array<CarImageProps>;
}

export interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}

export default () => {
  const [cars, setCars] = useState<CarsProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>()
  const [input, setInput] = useState('')

  useEffect(() => {
    loadCars()
  }, [])

  function loadCars() {
    const carsRef = collection(db, 'cars')
    const queryRef = query(carsRef, orderBy('created', 'desc'))

    getDocs(queryRef)
      .then((snapshot) => {
        let listCars = [] as CarsProps[]
        snapshot.forEach(doc => {
          listCars.push({
            id: doc.id,
            name: doc.data().name,
            year: doc.data().year,
            km: doc.data().km,
            city: doc.data().city,
            price: doc.data().price,
            img: doc.data().images,
            uid: doc.data().uid
          })
        })
        setCars(listCars)
      })
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded || [], id])
  }

  async function handleSearchCar() {
    if (input.trim().length <= 0) {
      loadCars()
      return;
    }
    setCars([])
    setLoadImages([])

    const q = query(collection(db, 'cars'),
      where('name', '>=', input.toUpperCase()),
      where('name', '<=', input.toUpperCase() + "\uf8ff"),
    )

    let listCars = [] as CarsProps[]

    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      listCars.push({
        id: doc.id,
        name: doc.data().name,
        year: doc.data().year,
        km: doc.data().km,
        city: doc.data().city,
        price: doc.data().price,
        img: doc.data().images,
        uid: doc.data().uid
      })
    })
    setCars(listCars)
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg gap-2 w-full max-w-3xl mx-auto flex justify-center items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          type="text"
          placeholder="digite o nome do carro..."
        />
        <button
          className="bg-red-600 h-9 px-8 rounded-lg text-white font-semibold text-lg"
          onClick={handleSearchCar}
        >
          Buscar
        </button>
      </section>
      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <Link key={car.id} to={`/car/${car.id}`}>
            <section
              className="w-full [&>img:nth-child(2)]:hover:scale-105 cursor-pointer bg-white overflow-hidden rounded-lg drop-shadow-lg"
            >
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{
                  display: loadImages?.includes(car.id) ? 'none' : 'block'
                }}
              ></div>
              <img
                className="w-full rounded-lg mb-2 max-h-72 transition-all"
                src={car.img[0].url}
                alt="Carro"
                onLoad={() => handleImageLoad(car.id)}
                style={{
                  display: loadImages?.includes(car.id) ? 'block' : 'none'
                }}
              />
              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">{car.year} | {car.km} km</span>
                <strong className="text-black font-semibold text-xl">R$ {car.price}</strong>
              </div>
              <div className="w-full h-px bg-slate-200 my-2"></div>
              <div className="px-2 pb-2">
                <span className="text-zinc-700">
                  {car.city}
                </span>
              </div>
            </section>
          </Link>
        ))}
      </main>

    </Container>
  )
}