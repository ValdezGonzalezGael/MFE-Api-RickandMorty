import React from "react";
//@ts-ignore
const ModalCharacterDetail = React.lazy(() => import("Characters/RickAndMortyView"),);

const Contenedor = () => {
    return (
        <div className="relative min-h-screen">
            <ModalCharacterDetail />

            <div className="pointer-events-none fixed bottom-4 right-4 z-50 select-none text-2xl text-gray-400 opacity-40">
                @Gael Alejandro Valdez González
            </div>
        </div>
    );
};

export default Contenedor;